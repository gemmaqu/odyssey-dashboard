/**
 * Custom fetch mutator used by every generated Orval hook. It owns the base URL
 * and turns non-2xx responses into a typed {@link ApiError} carrying the
 * backend's error envelope, so UI code can branch on `error.body.error.code`.
 */

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody | undefined,
  ) {
    super(body?.error?.message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
  }
}

let baseUrl = '';

/** Called once at app startup with EXPO_PUBLIC_API_URL. */
export function configureApiClient(options: { baseUrl: string }): void {
  baseUrl = options.baseUrl.replace(/\/$/, '');
}

/**
 * Orval's fetch client types every call as `Promise<{ status, data, headers }>`,
 * so the mutator returns that wrapper. Feature hooks unwrap `.data` via React
 * Query's `select`. Non-2xx responses throw {@link ApiError}.
 */
export const customFetch = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${baseUrl}${url}`, options);
  const text = await response.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!response.ok) {
    throw new ApiError(response.status, data as ApiErrorBody | undefined);
  }
  return { status: response.status, data, headers: response.headers } as T;
};
