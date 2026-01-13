import { apiClient } from '@/lib/api';

export interface ApiKey {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  usageCount: number;
  lastUsed?: string;
  expiresAt: string;
  createdAt: string;
  createdBy?: string;
}

export interface CreateApiKeyRequest {
  name: string;
  description?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  name: string;
  description?: string;
  rawKey: string;
  expiresAt: string;
  createdAt: string;
}

export const apiKeysApi = {
  generateKey: async (data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> => {
    const response = await apiClient.request('/admin/api-keys', {
      method: 'POST',
      body: JSON.stringify(data),
      requireAuth: true,
    });
    return response.data as CreateApiKeyResponse;
  },

  getAllKeys: async (): Promise<ApiKey[]> => {
    const response = await apiClient.request('/admin/api-keys', {
      method: 'GET',
      requireAuth: true,
    });
    return response.data as ApiKey[];
  },

  revokeKey: async (id: string): Promise<string> => {
    const response = await apiClient.request(`/admin/api-keys/${id}/revoke`, {
      method: 'PUT',
      requireAuth: true,
    });
    return response.message as string;
  },

  deleteKey: async (id: string): Promise<string> => {
    const response = await apiClient.request(`/admin/api-keys/${id}`, {
      method: 'DELETE',
      requireAuth: true,
    });
    return response.message as string;
  },
};
