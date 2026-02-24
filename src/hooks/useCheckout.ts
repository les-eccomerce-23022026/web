import { useState, useEffect } from 'react';
import { CheckoutService } from '@/services/CheckoutService';
import type { CheckoutInfo } from '@/interfaces/Checkout';

export function useCheckout() {
  const [data, setData] = useState<CheckoutInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    CheckoutService.getCheckoutInfo()
      .then((checkoutData) => {
        setData(checkoutData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
