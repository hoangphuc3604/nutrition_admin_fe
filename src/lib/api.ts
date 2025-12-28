import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface ApiResponse<T> {
  message: string;
  data?: T;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
}

interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
  skipRetry?: boolean; 
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthHeaders(): HeadersInit {
    const stored = localStorage.getItem('auth-storage');
    const token = stored ? JSON.parse(stored).state?.accessToken : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async refreshTokens(): Promise<boolean> {
    try {
      const stored = localStorage.getItem('auth-storage');
      const refreshToken = stored ? JSON.parse(stored).state?.refreshToken : null;
      if (!refreshToken) {
        console.error('[API] No refresh token available');
        return false;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        console.error('[API] Refresh token failed:', response.status);
        return false;
      }

      const data: ApiResponse<any> = await response.json();

      if (data.accessToken && data.refreshToken && data.data?.user) {
        useAuthStore.getState().setAuth(data.data.user, data.accessToken, data.refreshToken);
        console.log('[API] Tokens refreshed successfully');
        return true;
      }

      console.error('[API] Invalid refresh response format');
      return false;
    } catch (error) {
      console.error('[API] Refresh token error:', error);
      return false;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { requireAuth = false, skipRetry = false, ...fetchOptions } = options;

    const headers = requireAuth
      ? { ...this.getAuthHeaders(), ...fetchOptions.headers }
      : { 'Content-Type': 'application/json', ...fetchOptions.headers };

    const url = `${this.baseURL}${endpoint}`;

    let response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (response.status === 401 && !skipRetry && requireAuth) {
      console.log('[API] Received 401, attempting token refresh...');

      const refreshSuccess = await this.refreshTokens();

      if (refreshSuccess) {
        const newHeaders = requireAuth
          ? { ...this.getAuthHeaders(), ...fetchOptions.headers }
          : { 'Content-Type': 'application/json', ...fetchOptions.headers };

        response = await fetch(url, {
          ...fetchOptions,
          headers: newHeaders,
        });
      } else {
        console.log('[API] Token refresh failed, clearing auth');
        useAuthStore.getState().clearAuth();
        throw new Error('Authentication failed. Please log in again.');
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

