import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
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
      const result = await prisma.$transaction(async (tx) => {
        // Create participant record
        const participantResult = await tx.participant.create({
          data: {
            firstName: metadata.firstName,
            lastName: metadata.lastName,
            email: metadata.email,
            phone: metadata.phone || null,
            isGuest: 1,
            createdAt: new Date(),
          },
          select: { participantId: true },
        });
        
        const participantId = participantResult.participantId;
        const eventId = parseInt(metadata.eventId);
        const amountInEur = paymentIntent.amount / 100;
        
        // Create event registration
        const registrationResult = await tx.eventRegistration.create({
          data: {
            participantId,
            eventId,
            totalAmount: amountInEur,
            paidAmount: amountInEur,
            paymentStatus: 'paid',
            status: 'registered',
            registrationDate: new Date(),
          },
          select: { registrationId: true },
        });
        
        // Create payment record
        await tx.payment.create({
          data: {
            participantId,
            eventId,
            registrationId: registrationResult.registrationId,
            amount: amountInEur,
            currency: 'EUR',
            paymentMethod: 'stripe',
            status: 'completed',
            stripePaymentIntentId: paymentIntent.id,
            paidAt: new Date().toISOString(),
            createdAt: new Date(),
          },
        });
        
        // Count current registrations for this event
        const registrationCount = await tx.eventRegistration.count({
          where: { eventId },
        });
        
        // Update event registration count
        await tx.event.update({
          where: { eventId },
          data: {
            currentRegistrations: registrationCount,
          },
        });
        
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