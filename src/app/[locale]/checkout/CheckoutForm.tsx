'use client';

import { useState } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';

interface CheckoutFormProps {
  locale: string;
  subtotal: number;
}

interface BillingData {
  name: string;
  email: string;
  phone_number: string;
}

export default function CheckoutForm({ locale, subtotal }: CheckoutFormProps) {
  const [billingData, setBillingData] = useState<BillingData>({
    name: '',
    email: '',
    phone_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: keyof BillingData, value: string) => {
    setBillingData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): boolean => {
    if (!billingData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!billingData.email.trim() || !billingData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!billingData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          billingData,
          currency: 'EGP',
          paymentMethod: 'card',
          language: locale === 'ar' ? 'ar' : 'en',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      // Redirect to XPay iframe
      if (data.iframe_url) {
        // Open in same window for better UX
        window.location.href = data.iframe_url;
      } else {
        throw new Error('No payment URL received');
      }

    } catch (err) {
      console.error('Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fmtEGP = (value: number) => {
    try {
      return new Intl.NumberFormat(locale || "en", {
        style: "currency",
        currency: "EGP",
        maximumFractionDigits: 0,
      }).format(value);
    } catch {
      return `${value} EGP`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Billing Information */}
      <div>
        <h2 className="text-lg font-semibold text-white/90 mb-4">Billing Information</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/80 mb-2">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              value={billingData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white/90 outline-none transition focus:border-white/30 focus:bg-black/40"
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/80 mb-2">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              value={billingData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white/90 outline-none transition focus:border-white/30 focus:bg-black/40"
              placeholder="Enter your email address"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-2">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              value={billingData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              className="w-full rounded-xl border border-white/15 bg-black/30 px-4 py-3 text-white/90 outline-none transition focus:border-white/30 focus:bg-black/40"
              placeholder="+20 1XX XXX XXXX"
              required
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-white/50">
              Include country code (e.g., +20 for Egypt)
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Payment Summary */}
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-white/70">Order Total</span>
              <span className="font-semibold text-white/90">{fmtEGP(subtotal)}</span>
            </div>
            <div className="text-xs text-white/50">
              Final amount including payment processing fees will be shown on the payment page.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-white px-6 py-4 text-base font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5" />
                Proceed to Payment
              </>
            )}
          </button>

          <div className="text-xs text-white/50 text-center">
            You will be redirected to XPay&apos;s secure payment gateway to complete your purchase.
          </div>
        </form>
      </div>
    </div>
  );
}
