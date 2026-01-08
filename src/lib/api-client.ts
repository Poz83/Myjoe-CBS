import { toast } from 'sonner';

export interface ApiError {
  error: string;
  message?: string;
  status: number;
}

export class ApiClientError extends Error {
  status: number;
  
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
  }
}

interface FetchOptions extends RequestInit {
  /** Show toast on error (default: true) */
  showErrorToast?: boolean;
  /** Custom error message for toast */
  errorMessage?: string;
}

/**
 * Fetch wrapper with automatic error handling, type inference, and toast notifications.
 * 
 * @example
 * const data = await apiClient<ProjectResponse>('/api/projects/123');
 * 
 * @example
 * const data = await apiClient<CreateResponse>('/api/projects', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'My Project' }),
 * });
 */
export async function apiClient<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { showErrorToast = true, errorMessage, ...fetchOptions } = options;

  // Set default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  };

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Handle 401 - Session timeout
    if (response.status === 401) {
      const returnUrl = encodeURIComponent(window.location.pathname);
      toast.error("You've been signed out. Please sign in again.");
      window.location.href = `/auth/signin?returnTo=${returnUrl}`;
      throw new ApiClientError('Session expired', 401);
    }

    // Handle 429 - Rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      const seconds = retryAfter ? parseInt(retryAfter, 10) : 60;
      
      if (showErrorToast) {
        toast.error(`You're doing that too fast. Please wait ${seconds} seconds and try again.`);
      }
      throw new ApiClientError('Rate limited', 429);
    }

    // Handle other errors
    if (!response.ok) {
      let errorMsg = errorMessage || 'Something went wrong';
      
      try {
        const errorData = await response.json();
        errorMsg = errorData.error || errorData.message || errorMsg;
      } catch {
        // Response wasn't JSON, use status text
        errorMsg = response.statusText || errorMsg;
      }

      if (showErrorToast) {
        toast.error(errorMsg);
      }
      
      throw new ApiClientError(errorMsg, response.status);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    // Re-throw ApiClientError as-is
    if (error instanceof ApiClientError) {
      throw error;
    }

    // Handle network errors
    const networkError = "Can't connect right now. Please check your internet connection.";
    if (showErrorToast) {
      toast.error(networkError);
    }
    throw new ApiClientError(networkError, 0);
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiClient<T>(url, { ...options, method: 'GET' }),

  post: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(url, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(url: string, options?: FetchOptions) =>
    apiClient<T>(url, { ...options, method: 'DELETE' }),
};
