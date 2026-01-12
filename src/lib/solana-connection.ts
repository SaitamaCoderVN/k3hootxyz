import { Connection, ConnectionConfig } from '@solana/web3.js';

/**
 * Retry configuration for Solana RPC calls
 */
interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 5,
  initialDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, config: RetryConfig): number {
  const delay = Math.min(
    config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt),
    config.maxDelayMs
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Wrapper for Connection methods with automatic retry on 429 errors
 */
export class ResilientConnection extends Connection {
  private retryConfig: RetryConfig;

  constructor(
    endpoint: string,
    commitmentOrConfig?: ConnectionConfig | string,
    retryConfig?: Partial<RetryConfig>
  ) {
    super(endpoint, commitmentOrConfig);
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  /**
   * Execute function with retry logic
   */
  private async executeWithRetry<T>(
    fn: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;

        // Check if it's a 429 rate limit error
        const is429 =
          error?.message?.includes('429') ||
          error?.message?.includes('Too Many Requests') ||
          error?.code === 429;

        if (!is429 || attempt === this.retryConfig.maxRetries) {
          // Not a rate limit error or max retries reached
          throw error;
        }

        const delay = calculateDelay(attempt, this.retryConfig);
        console.warn(
          `⚠️ ${operationName} failed with 429. Retrying after ${Math.round(delay)}ms (attempt ${attempt + 1}/${this.retryConfig.maxRetries})...`
        );

        await sleep(delay);
      }
    }

    throw lastError || new Error(`Failed after ${this.retryConfig.maxRetries} retries`);
  }

  /**
   * Override common methods with retry logic
   */
  async getBalance(publicKey: Parameters<Connection['getBalance']>[0]) {
    return this.executeWithRetry(
      () => super.getBalance(publicKey),
      'getBalance'
    );
  }

  async getAccountInfo(
    publicKey: Parameters<Connection['getAccountInfo']>[0],
    commitmentOrConfig?: Parameters<Connection['getAccountInfo']>[1]
  ) {
    return this.executeWithRetry(
      () => super.getAccountInfo(publicKey, commitmentOrConfig),
      'getAccountInfo'
    );
  }

  async getLatestBlockhash(
    commitmentOrConfig?: Parameters<Connection['getLatestBlockhash']>[0]
  ) {
    return this.executeWithRetry(
      () => super.getLatestBlockhash(commitmentOrConfig),
      'getLatestBlockhash'
    );
  }

  async sendRawTransaction(
    rawTransaction: Parameters<Connection['sendRawTransaction']>[0],
    options?: Parameters<Connection['sendRawTransaction']>[1]
  ) {
    return this.executeWithRetry(
      () => super.sendRawTransaction(rawTransaction, options),
      'sendRawTransaction'
    );
  }

  async confirmTransaction(
    signature: Parameters<Connection['confirmTransaction']>[0],
    commitment?: Parameters<Connection['confirmTransaction']>[1]
  ) {
    return this.executeWithRetry(
      () => super.confirmTransaction(signature, commitment),
      'confirmTransaction'
    );
  }

  async simulateTransaction(
    transactionOrMessage: Parameters<Connection['simulateTransaction']>[0],
    configOrSigners?: Parameters<Connection['simulateTransaction']>[1],
    includeAccounts?: Parameters<Connection['simulateTransaction']>[2]
  ) {
    return this.executeWithRetry(
      () => super.simulateTransaction(transactionOrMessage, configOrSigners as any, includeAccounts),
      'simulateTransaction'
    );
  }
}

/**
 * Create a resilient connection instance
 */
export function createResilientConnection(
  network: 'devnet' | 'mainnet' = 'devnet',
  retryConfig?: Partial<RetryConfig>
): ResilientConnection {
  const endpoint =
    network === 'devnet'
      ? process.env.NEXT_PUBLIC_SOLANA_DEVNET_RPC || 'https://api.devnet.solana.com'
      : process.env.NEXT_PUBLIC_SOLANA_MAINNET_RPC || 'https://api.mainnet-beta.solana.com';

  return new ResilientConnection(endpoint, 'confirmed', retryConfig);
}
