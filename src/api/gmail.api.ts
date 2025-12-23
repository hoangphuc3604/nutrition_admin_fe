import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface GmailTokenStatus {
  isAuthenticated: boolean;
  hasToken: boolean;
  hasRefreshToken?: boolean;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

const gmailApi = {
  getStatus: async (): Promise<GmailTokenStatus> => {
    const response = await apiClient.get<GmailTokenStatus>('/auth/gmail/status', {
      requireAuth: true,
    });
    return response.data!;
  },

  authorize: () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
    window.open(`${baseURL}/auth/gmail/authorize`, '_blank');
  }
};

export const useGmailStatus = () => {
  return useQuery({
    queryKey: ['gmail-status'],
    queryFn: gmailApi.getStatus,
  });
};

export { gmailApi };
