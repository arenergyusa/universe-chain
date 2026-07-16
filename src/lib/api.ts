import { ApiResponse } from '@/types/api';

class ApiError extends Error {
  code: string;
  constructor(message: string, code: string = 'API_ERROR') {
    super(message);
    this.code = code;
  }
}

export async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  let rawData: unknown;
  try {
    rawData = await res.json();
  } catch {
    throw new ApiError('Failed to parse API response', 'PARSE_ERROR');
  }

  if (!rawData || typeof rawData !== 'object') {
    throw new ApiError('Invalid API response format received', 'FORMAT_ERROR');
  }

  const data = rawData as ApiResponse<T>;

  if (!res.ok || !data.success) {
    let errorMsg = 'An unexpected error occurred';
    let errorCode = `HTTP_${res.status}`;
    
    if (!data.success) {
      errorMsg = data.error?.message || errorMsg;
      errorCode = data.error?.code || errorCode;
    }
    
    throw new ApiError(errorMsg, errorCode);
  }

  return data.data as T;
}
