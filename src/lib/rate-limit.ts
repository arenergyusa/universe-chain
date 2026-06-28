import { NextResponse } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

// In-memory store (works well enough for serverless edge scaling unless highly distributed)
// For true global rate limiting, Redis (Upstash) is recommended.
const rateLimitMap = new Map<string, RateLimitEntry>();

export function rateLimit(ip: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (record) {
    if (now > record.resetTime) {
      // Window expired, reset
      rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
      return { success: true };
    }

    if (record.count >= limit) {
      return { success: false, resetTime: record.resetTime };
    }

    record.count += 1;
    rateLimitMap.set(ip, record);
    return { success: true };
  } else {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { success: true };
  }
}

/**
 * Middleware wrapper to check rate limit easily in API routes.
 */
export function checkRateLimit(req: Request, limit = 5, windowMs = 60000) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = rateLimit(ip, limit, windowMs);
  
  if (!success) {
    return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
  }
  return null;
}
