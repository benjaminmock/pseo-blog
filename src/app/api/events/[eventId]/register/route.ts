import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { z } from 'zod';
import { events } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { paymentRateLimit } from '@/lib/rateLimit';

const registrationSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    // Apply rate limiting
    const rateLimitResult = paymentRateLimit(request);
    if (rateLimitResult.isLimited) {
      return NextResponse.json(
        {
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.total.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const eventId = parseInt(params.eventId);
    const body = await request.json();
    
    // Validate input
    const validatedData = registrationSchema.parse(body);
    
    // Get event details using Drizzle ORM
    const event = await db
      .select({
        eventId: events.eventId,
        eventName: events.eventName,
        price: events.price,
        maxParticipants: events.maxParticipants,
        currentRegistrations: events.currentRegistrations,
        active: events.active,
      })
      .from(events)
      .where(and(eq(events.eventId, eventId), eq(events.active, 1)))
      .get();
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Check if event has a price (required for payment)
    if (!event.price || event.price <= 0) {
      return NextResponse.json({ error: 'Event is not available for purchase' }, { status: 400 });
    }
    
    // Check availability
    if (event.maxParticipants && event.currentRegistrations >= event.maxParticipants) {
      return NextResponse.json({ error: 'Event is full' }, { status: 400 });
    }
    
    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: formatAmountForStripe(event.price),
      currency: 'eur',
      metadata: {
        eventId: eventId.toString(),
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        phone: validatedData.phone || '',
      },
    });
    
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      eventName: event.eventName,
      price: event.price,
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    // Handle Stripe errors
    if (error && typeof error === 'object' && 'type' in error) {
      return NextResponse.json(
        { error: 'Payment processing error' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}