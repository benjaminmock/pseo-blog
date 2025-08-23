import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { participants, eventRegistrations, payments, events } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { webhookRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // Apply rate limiting for webhook endpoint
  const rateLimitResult = webhookRateLimit(request);
  if (rateLimitResult.isLimited) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
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

  const body = await request.text();
  const signature = headers().get('stripe-signature');
  
  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }
  
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const metadata = paymentIntent.metadata;
      
      // Start a transaction to ensure data consistency
      const result = await db.transaction(async (tx) => {
        // Create participant record
        const [participantResult] = await tx
          .insert(participants)
          .values({
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            email: metadata.email,
            phone: metadata.phone || null,
            isGuest: 1,
            createdAt: new Date().toISOString(),
          })
          .returning({ participantId: participants.participantId });
        
        const participantId = participantResult.participantId;
        const eventId = parseInt(metadata.eventId);
        const amountInEur = paymentIntent.amount / 100;
        
        // Create event registration
        const [registrationResult] = await tx
          .insert(eventRegistrations)
          .values({
            participantId,
            eventId,
            totalAmount: amountInEur,
            paidAmount: amountInEur,
            paymentStatus: 'paid',
            status: 'registered',
            registrationDate: new Date().toISOString(),
          })
          .returning({ registrationId: eventRegistrations.registrationId });
        
        // Create payment record
        await tx
          .insert(payments)
          .values({
            participantId,
            eventId,
            registrationId: registrationResult.registrationId,
            amount: amountInEur,
            currency: 'EUR',
            paymentMethod: 'stripe',
            status: 'completed',
            stripePaymentIntentId: paymentIntent.id,
            paidAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        
        // Update event registration count
        await tx
          .update(events)
          .set({
            currentRegistrations: db.$count(
              eventRegistrations,
              eq(eventRegistrations.eventId, eventId)
            ),
          })
          .where(eq(events.eventId, eventId));
        
        return {
          participantId,
          registrationId: registrationResult.registrationId,
          eventId,
        };
      });
      
      console.log('Payment processed successfully:', {
        paymentIntentId: paymentIntent.id,
        participantId: result.participantId,
        eventId: result.eventId,
        amount: paymentIntent.amount / 100,
      });
      
      // TODO: Send confirmation email
      // await sendEventConfirmationEmail(
      //   metadata.email,
      //   `${metadata.firstName} ${metadata.lastName}`,
      //   eventDetails
      // );
    }
    
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    
    // Log the error details for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}