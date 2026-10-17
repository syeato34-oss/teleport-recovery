import { useSyncExternalStore } from 'react';
import { getPhoneNumber, getFallbackPhoneNumber, subscribePhoneNumber } from '@/lib/phoneNumber';

export function usePhoneNumber() {
  return useSyncExternalStore(subscribePhoneNumber, getPhoneNumber, getFallbackPhoneNumber);
}
