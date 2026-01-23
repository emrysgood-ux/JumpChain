/**
 * Circuit Breaker Implementation
 *
 * Prevents cascade failures by temporarily blocking requests to failing services.
 * Pattern: Closed (normal) -> Open (blocking) -> Half-Open (testing) -> Closed
 */

import {
  CircuitBreakerConfig,
  CircuitBreakerState,
  CircuitState,
  DEFAULT_CIRCUIT_BREAKER_CONFIG
} from './types';

export class CircuitBreaker {
  private state: CircuitBreakerState;
  private config: CircuitBreakerConfig;
  private failureTimestamps: number[] = [];
  private name: string;

  constructor(name: string, config: Partial<CircuitBreakerConfig> = {}) {
    this.name = name;
    this.config = { ...DEFAULT_CIRCUIT_BREAKER_CONFIG, ...config };
    this.state = {
      state: 'closed',
      failureCount: 0,
      halfOpenSuccesses: 0,
      lastFailureAt: null,
      nextAttemptAt: null
    };
  }

  /**
   * Check if a request should be allowed through
   */
  canExecute(): boolean {
    this.pruneOldFailures();

    switch (this.state.state) {
      case 'closed':
        return true;

      case 'open':
        // Check if it's time to try half-open
        if (this.state.nextAttemptAt && new Date() >= this.state.nextAttemptAt) {
          this.transitionTo('half_open');
          return true;
        }
        return false;

      case 'half_open':
        // Allow limited requests in half-open state
        return true;

      default:
        return false;
    }
  }

  /**
   * Get time until circuit might allow requests (ms)
   */
  getTimeUntilRetry(): number | null {
    if (this.state.state !== 'open' || !this.state.nextAttemptAt) {
      return null;
    }
    const remaining = this.state.nextAttemptAt.getTime() - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Record a successful execution
   */
  recordSuccess(): void {
    switch (this.state.state) {
      case 'closed':
        // Reset failure count on success
        this.failureTimestamps = [];
        this.state.failureCount = 0;
        break;

      case 'half_open':
        this.state.halfOpenSuccesses++;
        if (this.state.halfOpenSuccesses >= this.config.successThreshold) {
          this.transitionTo('closed');
        }
        break;

      case 'open':
        // Shouldn't happen, but just in case
        break;
    }
  }

  /**
   * Record a failed execution
   */
  recordFailure(_error?: Error): void {
    const now = Date.now();
    this.failureTimestamps.push(now);
    this.state.failureCount++;
    this.state.lastFailureAt = new Date(now);

    switch (this.state.state) {
      case 'closed':
        this.pruneOldFailures();
        if (this.failureTimestamps.length >= this.config.failureThreshold) {
          this.transitionTo('open');
        }
        break;

      case 'half_open':
        // Any failure in half-open immediately opens the circuit
        this.transitionTo('open');
        break;

      case 'open':
        // Already open, extend the timeout
        this.state.nextAttemptAt = new Date(now + this.config.resetTimeoutMs);
        break;
    }
  }

  /**
   * Get current state for monitoring
   */
  getState(): CircuitBreakerState & { name: string } {
    return {
      ...this.state,
      name: this.name
    };
  }

  /**
   * Force reset to closed state (use with caution)
   */
  reset(): void {
    this.transitionTo('closed');
    this.failureTimestamps = [];
  }

  /**
   * Force open the circuit (for maintenance/testing)
   */
  forceOpen(durationMs?: number): void {
    this.transitionTo('open');
    if (durationMs) {
      this.state.nextAttemptAt = new Date(Date.now() + durationMs);
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state.state;
    this.state.state = newState;

    switch (newState) {
      case 'closed':
        this.state.failureCount = 0;
        this.state.halfOpenSuccesses = 0;
        this.state.nextAttemptAt = null;
        this.failureTimestamps = [];
        break;

      case 'open':
        this.state.halfOpenSuccesses = 0;
        this.state.nextAttemptAt = new Date(Date.now() + this.config.resetTimeoutMs);
        break;

      case 'half_open':
        this.state.halfOpenSuccesses = 0;
        break;
    }

    // Could emit events here for monitoring
    console.log(`[CircuitBreaker:${this.name}] ${oldState} -> ${newState}`);
  }

  private pruneOldFailures(): void {
    const cutoff = Date.now() - this.config.windowMs;
    this.failureTimestamps = this.failureTimestamps.filter(ts => ts > cutoff);
    this.state.failureCount = this.failureTimestamps.length;
  }
}

/**
 * Circuit Breaker Registry - manages circuit breakers by name
 */
export class CircuitBreakerRegistry {
  private breakers = new Map<string, CircuitBreaker>();
  private defaultConfig: Partial<CircuitBreakerConfig>;

  constructor(defaultConfig: Partial<CircuitBreakerConfig> = {}) {
    this.defaultConfig = defaultConfig;
  }

  /**
   * Get or create a circuit breaker by name
   */
  get(name: string, config?: Partial<CircuitBreakerConfig>): CircuitBreaker {
    if (!this.breakers.has(name)) {
      this.breakers.set(
        name,
        new CircuitBreaker(name, { ...this.defaultConfig, ...config })
      );
    }
    return this.breakers.get(name)!;
  }

  /**
   * Check if any circuit is open (system health indicator)
   */
  hasOpenCircuit(): boolean {
    for (const breaker of this.breakers.values()) {
      if (breaker.getState().state === 'open') {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all circuit states for monitoring dashboard
   */
  getAllStates(): Array<CircuitBreakerState & { name: string }> {
    return Array.from(this.breakers.values()).map(b => b.getState());
  }

  /**
   * Reset all circuits (emergency recovery)
   */
  resetAll(): void {
    for (const breaker of this.breakers.values()) {
      breaker.reset();
    }
  }
}

/**
 * Decorator/wrapper for adding circuit breaker to any async function
 */
export function withCircuitBreaker<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  breaker: CircuitBreaker,
  options: {
    fallback?: (...args: Parameters<T>) => Promise<ReturnType<T>>;
    onOpen?: () => void;
  } = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    if (!breaker.canExecute()) {
      const timeUntilRetry = breaker.getTimeUntilRetry();
      if (options.fallback) {
        console.warn(
          `[CircuitBreaker] Circuit open, using fallback. Retry in ${timeUntilRetry}ms`
        );
        return options.fallback(...args);
      }
      throw new CircuitOpenError(
        `Circuit breaker is open. Retry in ${timeUntilRetry}ms`,
        timeUntilRetry
      );
    }

    try {
      const result = await fn(...args);
      breaker.recordSuccess();
      return result as ReturnType<T>;
    } catch (error) {
      breaker.recordFailure(error instanceof Error ? error : new Error(String(error)));
      if (breaker.getState().state === 'open' && options.onOpen) {
        options.onOpen();
      }
      throw error;
    }
  }) as T;
}

/**
 * Custom error for circuit breaker open state
 */
export class CircuitOpenError extends Error {
  readonly retryInMs: number | null;

  constructor(message: string, retryInMs: number | null = null) {
    super(message);
    this.name = 'CircuitOpenError';
    this.retryInMs = retryInMs;
  }
}
