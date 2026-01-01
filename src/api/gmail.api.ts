import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface GmailTokenStatus {
  isAuthenticated: boolean;
  hasToken: boolean;
  hasRefreshToken?: boolean;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

const gmailApi = {
  getStatus: async (): Promise<GmailTokenStatus> => {
    const response = await apiClient.get<GmailTokenStatus>('/admin/gmail-auth/status', {
      requireAuth: true,
    });
    return response.data!;
  },

  authorize: () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    const stored = localStorage.getItem('auth-storage');
    const token = stored ? JSON.parse(stored).state?.accessToken : null;

    if (!token) {
      console.error('No access token available for Gmail authorization');
      return;
    }

    const url = `${baseURL}/admin/gmail-auth/authorize?token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  }
};

export const useGmailStatus = () => {
  return useQuery({
    queryKey: ['gmail-status'],
    queryFn: gmailApi.getStatus,
  });
};

export { gmailApi };
