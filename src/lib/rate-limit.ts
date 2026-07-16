import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && (!redisUrl || !redisToken)) {
  throw new Error('Redis configuration is required for rate limiting in production. Cannot start without UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.');
}

const redis = redisUrl && redisToken ? Redis.fromEnv() : null;

// Fallback in-memory map for local development without Redis
const fallbackMap = isProduction ? null : new Map<string, { count: number; resetTime: number }>();

export async function rateLimit(ip: string, limit = 5, windowMs = 60000) {
  if (redis) {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
      analytics: true,
    });
    const { success, reset } = await ratelimit.limit(ip);
    return { success, resetTime: reset };
  } else if (fallbackMap) {
    // Fallback logic
    const now = Date.now();
    const record = fallbackMap.get(ip);
    if (record) {
      if (now > record.resetTime) {
        fallbackMap.set(ip, { count: 1, resetTime: now + windowMs });
        return { success: true, resetTime: now + windowMs };
      }
      if (record.count >= limit) {
        return { success: false, resetTime: record.resetTime };
      }
      record.count += 1;
      fallbackMap.set(ip, record);
      return { success: true, resetTime: record.resetTime };
    } else {
      fallbackMap.set(ip, { count: 1, resetTime: now + windowMs });
      return { success: true, resetTime: now + windowMs };
    }
  } else {
    // Failsafe if neither is available (should not happen due to production check)
    return { success: false, resetTime: Date.now() + windowMs };
  }
}

export async function checkRateLimit(req: Request, limit = 5, windowMs = 60000) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  
  // Use platform-trusted real IP or the last proxy in the forwarded chain
  let ip = realIp || (forwardedFor ? forwardedFor.split(',').pop()?.trim() : null);
  
  if (!ip) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ success: false, error: { code: 'FORBIDDEN', message: 'Client identity could not be determined.' } }, { status: 403 });
    }
    ip = 'dev-local-client';
  }
  
  const { success } = await rateLimit(ip, limit, windowMs);
  
  if (!success) {
    return NextResponse.json({ success: false, error: { code: 'TOO_MANY_REQUESTS', message: 'Too many requests. Please try again later.' } }, { status: 429 });
  }
  return null;
}
