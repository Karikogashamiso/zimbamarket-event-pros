// Utility: Fetch with timeout and retry logic (max 3 total attempts)
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxAttempts: number = 3,
  timeout: number = 30000
): Promise<Response> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`Payment request attempt ${attempt}/${maxAttempts}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`Payment request attempt ${attempt} succeeded`);
      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === maxAttempts;
      const isAbortError = error.name === 'AbortError';
      
      console.warn(`Payment attempt ${attempt}/${maxAttempts} failed:`, {
        error: error.message,
        isTimeout: isAbortError,
      });

      if (isLastAttempt) {
        console.error(`All ${maxAttempts} payment attempts failed, giving up`);
        throw new Error(
          isAbortError 
            ? `Request timeout after ${timeout}ms` 
            : `Network error after ${maxAttempts} attempts: ${error.message}`
        );
      }

      // Quick retry: 1s, 2s delays only
      const backoffDelay = attempt * 1000;
      console.log(`Retrying in ${backoffDelay}ms...`);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw new Error('Fetch failed after all retries');
}
