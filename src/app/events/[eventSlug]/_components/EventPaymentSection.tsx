'use client';

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the GuestPaymentForm to avoid SSR issues with Stripe
const GuestPaymentForm = dynamic(
  () => import("@/components/GuestPaymentForm"),
  { ssr: false }
);

interface EventPaymentSectionProps {
  eventId: number;
  eventName: string;
  price: number;
}

export default function EventPaymentSection({ 
  eventId, 
  eventName, 
  price 
}: EventPaymentSectionProps) {
  const router = useRouter();

  const handlePaymentSuccess = () => {
    // Use Next.js router for client-side navigation
    router.push('/events/payment/success');
  };

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Event buchen</h3>
      <GuestPaymentForm
        eventId={eventId}
        eventName={eventName}
        price={price}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}