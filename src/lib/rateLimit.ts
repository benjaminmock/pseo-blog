import { NextRequest } from 'next/server';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// In-memory store for rate limiting (in production, use Redis or similar)
const store: RateLimitStore = {};

export function rateLimit(maxRequests: number, windowMs: number) {
  return (request: NextRequest) => {
    // Get client IP address
    const ip = request.ip || 
               request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown';
    
    const now = Date.now();
    const key = `rate_limit:${ip}`;
    
    // Clean up expired entries
    if (store[key] && now > store[key].resetTime) {
      delete store[key];
    }
    
    // Initialize or get current count
    if (!store[key]) {
      store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }
    
    // Increment count
    store[key].count++;
    
    // Check if limit exceeded
    const isLimited = store[key].count > maxRequests;
    const remaining = Math.max(0, maxRequests - store[key].count);
    const resetTime = store[key].resetTime;
    
    return {
      isLimited,
      remaining,
      resetTime,
      total: maxRequests,
    };
  };
}

// Predefined rate limiters
export const paymentRateLimit = rateLimit(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const webhookRateLimit = rateLimit(100, 60 * 1000); // 100 requests per minute