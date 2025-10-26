/**
 * Rate Limiter Utility
 * 
 * Provides client-side rate limiting to prevent brute-force attacks
 * and excessive API calls. This is a defense-in-depth measure that
 * complements server-side rate limiting.
 * 
 * SECURITY NOTE: This is client-side only and can be bypassed.
 * Always implement server-side rate limiting as the primary defense.
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface AttemptRecord {
  count: number;
  firstAttempt: number;
  blockedUntil?: number;
}

class RateLimiter {
  private attempts: Map<string, AttemptRecord> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up old entries every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if an action is allowed based on rate limit configuration
   * @param key Unique identifier for the action (e.g., 'login:user@example.com')
   * @param config Rate limit configuration
   * @returns Object with allowed status and remaining attempts
   */
  check(
    key: string,
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetIn?: number; blockedUntil?: number } {
    const now = Date.now();
    const record = this.attempts.get(key);

    // Check if currently blocked
    if (record?.blockedUntil && record.blockedUntil > now) {
      return {
        allowed: false,
        remaining: 0,
        resetIn: record.blockedUntil - now,
        blockedUntil: record.blockedUntil,
      };
    }

    // No previous attempts or window expired
    if (!record || now - record.firstAttempt > config.windowMs) {
      this.attempts.set(key, {
        count: 1,
        firstAttempt: now,
      });
      return {
        allowed: true,
        remaining: config.maxAttempts - 1,
      };
    }

    // Within window, check if limit exceeded
    if (record.count >= config.maxAttempts) {
      const blockDuration = config.blockDurationMs || config.windowMs * 2;
      const blockedUntil = now + blockDuration;
      
      this.attempts.set(key, {
        ...record,
        blockedUntil,
      });

      return {
        allowed: false,
        remaining: 0,
        resetIn: blockDuration,
        blockedUntil,
      };
    }

    // Increment count
    record.count++;
    this.attempts.set(key, record);

    return {
      allowed: true,
      remaining: config.maxAttempts - record.count,
    };
  }

  /**
   * Record a successful action (resets the counter)
   * @param key Unique identifier for the action
   */
  reset(key: string): void {
    this.attempts.delete(key);
  }

  /**
   * Get current status without incrementing
   * @param key Unique identifier for the action
   */
  getStatus(key: string): { count: number; blockedUntil?: number } | null {
    const record = this.attempts.get(key);
    if (!record) return null;

    const status: { count: number; blockedUntil?: number } = {
      count: record.count,
    };
    
    if (record.blockedUntil !== undefined) {
      status.blockedUntil = record.blockedUntil;
    }

    return status;
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.attempts.entries()) {
      // Remove if block expired and no recent attempts
      if (
        record.blockedUntil &&
        record.blockedUntil < now &&
        now - record.firstAttempt > 60 * 60 * 1000 // 1 hour
      ) {
        this.attempts.delete(key);
      }
    }
  }

  /**
   * Destroy the rate limiter and clean up resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.attempts.clear();
  }
}

// Singleton instance
export const rateLimiter = new RateLimiter();

// Predefined configurations for common use cases
export const RateLimitPresets = {
  // Login attempts: 5 attempts per 15 minutes, block for 30 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    blockDurationMs: 30 * 60 * 1000,
  },
  
  // Password reset: 3 attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    blockDurationMs: 60 * 60 * 1000,
  },
  
  // API calls: 100 requests per minute
  API_CALL: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
  },
  
  // Form submission: 10 per 5 minutes
  FORM_SUBMIT: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000,
  },
} as const;

/**
 * Format remaining time for user display
 */
export function formatResetTime(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  }
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}
