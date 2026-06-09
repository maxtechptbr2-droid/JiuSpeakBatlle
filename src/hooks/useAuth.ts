import { useAuth as useContextAuth } from '../contexts/AuthProvider';

export function useAuth() {
  return useContextAuth();
}
