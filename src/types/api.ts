/* eslint-disable @typescript-eslint/no-explicit-any */
export type ApiResponse<T = undefined> =
  | {
      success: true;
      data: T;
      meta?: Record<string, any>;
    }
  | {
      success: false;
      error: {
        code: string;
        message: string;
      };
    };

export interface PaginatedMeta {
  page: number;
  total: number;
  hasMore: boolean;
}
