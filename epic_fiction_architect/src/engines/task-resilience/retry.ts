/**
 * Retry Utilities with Exponential Backoff
 *
 * Handles transient failures gracefully with configurable retry strategies.
 */

import { RetryConfig, DEFAULT_RETRY_CONFIG } from './types';

export interface RetryState {
  attemptNumber: number;
  totalAttempts: number;
  lastError: Error | null;
  nextRetryAt: Date | null;
  startedAt: Date;
}

export interface RetryResult<T> {
  success: boolean;
  result?: T;
  error?: Error;
  attempts: number;
  totalTimeMs: number;
}

/**
 * Calculate delay for a retry attempt with exponential backoff and jitter
 */
export function calculateRetryDelay(
  attemptNumber: number,
  config: RetryConfig
): number {
  // Exponential backoff: baseDelay * (multiplier ^ attemptNumber)
  const exponentialDelay = config.baseDelayMs * Math.pow(
    config.backoffMultiplier,
    attemptNumber - 1
  );

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelayMs);

  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * config.jitterFactor * (Math.random() * 2 - 1);

  return Math.max(0, Math.round(cappedDelay + jitter));
}

/**
 * Check if an error should trigger a retry
 */
export function shouldRetry(
  error: Error,
  attemptNumber: number,
  config: RetryConfig
): boolean {
  // Check max attempts
  if (attemptNumber >= config.maxAttempts) {
    return false;
  }

  const errorName = error.name || 'Error';
  const errorMessage = error.message || '';

  // Check non-retryable errors
  if (config.nonRetryableErrors?.length) {
    for (const pattern of config.nonRetryableErrors) {
      if (errorName.includes(pattern) || errorMessage.includes(pattern)) {
        return false;
      }
    }
  }

  // Check retryable errors (if specified, only retry on these)
  if (config.retryableErrors?.length) {
    for (const pattern of config.retryableErrors) {
      if (errorName.includes(pattern) || errorMessage.includes(pattern)) {
        return true;
      }
    }
    return false;
  }

  // Default: retry all errors not in nonRetryable list
  return true;
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {},
  options: {
    onRetry?: (attempt: number, delay: number, error: Error) => void;
    onFailure?: (error: Error, attempts: number) => void;
    abortSignal?: AbortSignal;
  } = {}
): Promise<RetryResult<T>> {
  const fullConfig = { ...DEFAULT_RETRY_CONFIG, ...config };
  const startedAt = Date.now();
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= fullConfig.maxAttempts; attempt++) {
    // Check abort signal
    if (options.abortSignal?.aborted) {
      return {
        success: false,
        error: new Error('Operation aborted'),
        attempts: attempt,
        totalTimeMs: Date.now() - startedAt
      };
    }

    try {
      const result = await fn();
      return {
        success: true,
        result,
        attempts: attempt,
        totalTimeMs: Date.now() - startedAt
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!shouldRetry(lastError, attempt, fullConfig)) {
        if (options.onFailure) {
          options.onFailure(lastError, attempt);
        }
        return {
          success: false,
          error: lastError,
          attempts: attempt,
          totalTimeMs: Date.now() - startedAt
        };
      }

      // Calculate delay and wait
      if (attempt < fullConfig.maxAttempts) {
        const delay = calculateRetryDelay(attempt, fullConfig);

        if (options.onRetry) {
          options.onRetry(attempt, delay, lastError);
        }

        await sleep(delay, options.abortSignal);
      }
    }
  }

  // Exhausted all retries
  if (options.onFailure && lastError) {
    options.onFailure(lastError, fullConfig.maxAttempts);
  }

  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: fullConfig.maxAttempts,
    totalTimeMs: Date.now() - startedAt
  };
}

/**
 * Sleep with abort support
 */
export function sleep(ms: number, abortSignal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (abortSignal?.aborted) {
      reject(new Error('Operation aborted'));
      return;
    }

    const timeoutId = setTimeout(resolve, ms);

    abortSignal?.addEventListener('abort', () => {
      clearTimeout(timeoutId);
      reject(new Error('Operation aborted'));
    });
  });
}

/**
 * Create a retryable version of any async function
 */
export function makeRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  config: Partial<RetryConfig> = {},
  options: {
    onRetry?: (attempt: number, delay: number, error: Error, args: Parameters<T>) => void;
  } = {}
): T {
  return (async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> => {
    const result = await withRetry(
      () => fn(...args) as Promise<Awaited<ReturnType<T>>>,
      config,
      {
        onRetry: options.onRetry
          ? (attempt, delay, error) => options.onRetry!(attempt, delay, error, args)
          : undefined
      }
    );

    if (result.success) {
      return result.result!;
    }
    throw result.error;
  }) as T;
}

/**
 * Retry with progressive timeout extension
 *
 * Each retry gets more time to complete, useful for operations that
 * might fail due to timeout but could succeed with more time.
 */
export async function withProgressiveTimeout<T>(
  fn: (timeoutMs: number) => Promise<T>,
  config: {
    initialTimeoutMs: number;
    maxTimeoutMs: number;
    timeoutMultiplier: number;
    maxAttempts: number;
  }
): Promise<RetryResult<T>> {
  const startedAt = Date.now();
  let currentTimeout = config.initialTimeoutMs;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      const result = await Promise.race([
        fn(currentTimeout),
        new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout after ${currentTimeout}ms`)),
            currentTimeout
          )
        )
      ]);

      return {
        success: true,
        result,
        attempts: attempt,
        totalTimeMs: Date.now() - startedAt
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Increase timeout for next attempt
      currentTimeout = Math.min(
        currentTimeout * config.timeoutMultiplier,
        config.maxTimeoutMs
      );

      // Small delay between attempts
      if (attempt < config.maxAttempts) {
        await sleep(1000);
      }
    }
  }

  return {
    success: false,
    error: lastError || new Error('Unknown error'),
    attempts: config.maxAttempts,
    totalTimeMs: Date.now() - startedAt
  };
}

/**
 * Retry with fallback chain
 *
 * Try primary, then fall back through alternatives
 */
export async function withFallbackChain<T>(
  strategies: Array<{
    name: string;
    fn: () => Promise<T>;
    shouldTry?: () => boolean;
  }>,
  options: {
    onStrategyFailed?: (name: string, error: Error) => void;
  } = {}
): Promise<{ result: T; strategyUsed: string } | { error: Error; attemptedStrategies: string[] }> {
  const attemptedStrategies: string[] = [];

  for (const strategy of strategies) {
    // Check if we should try this strategy
    if (strategy.shouldTry && !strategy.shouldTry()) {
      continue;
    }

    attemptedStrategies.push(strategy.name);

    try {
      const result = await strategy.fn();
      return { result, strategyUsed: strategy.name };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (options.onStrategyFailed) {
        options.onStrategyFailed(strategy.name, err);
      }
      // Continue to next strategy
    }
  }

  return {
    error: new Error(`All ${attemptedStrategies.length} strategies failed`),
    attemptedStrategies
  };
}

/**
 * Common retry configurations for different scenarios
 */
export const RETRY_PRESETS = {
  /** Quick retries for network glitches */
  network: {
    maxAttempts: 4,
    baseDelayMs: 1000,
    maxDelayMs: 8000,
    backoffMultiplier: 2,
    jitterFactor: 0.2
  } as RetryConfig,

  /** Patient retries for rate limiting */
  rateLimited: {
    maxAttempts: 6,
    baseDelayMs: 5000,
    maxDelayMs: 60000,
    backoffMultiplier: 2,
    jitterFactor: 0.3
  } as RetryConfig,

  /** Aggressive retries for critical operations */
  critical: {
    maxAttempts: 10,
    baseDelayMs: 500,
    maxDelayMs: 30000,
    backoffMultiplier: 1.5,
    jitterFactor: 0.1
  } as RetryConfig,

  /** Single retry for quick fallback */
  quick: {
    maxAttempts: 2,
    baseDelayMs: 500,
    maxDelayMs: 1000,
    backoffMultiplier: 1,
    jitterFactor: 0
  } as RetryConfig,

  /** For AI API calls (handles connection issues) */
  aiApi: {
    maxAttempts: 5,
    baseDelayMs: 2000,
    maxDelayMs: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.25,
    retryableErrors: [
      'ECONNRESET',
      'ETIMEDOUT',
      'ENOTFOUND',
      'ENETUNREACH',
      'CONNECTION_RESET',
      'SOCKET_TIMEOUT',
      'overloaded',
      'rate_limit',
      '529',
      '503',
      '502',
      '500'
    ]
  } as RetryConfig
};
