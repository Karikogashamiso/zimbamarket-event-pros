// Utility: Fetch with timeout and retry logic
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  timeout: number = 30000
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error: any) {
      const isLastAttempt = attempt === retries;
      const isAbortError = error.name === 'AbortError';
      
      console.warn(`Attempt ${attempt}/${retries} failed:`, {
        error: error.message,
        isTimeout: isAbortError,
      });

      if (isLastAttempt) {
        throw new Error(
          isAbortError 
            ? `Request timeout after ${timeout}ms` 
            : `Network error after ${retries} attempts: ${error.message}`
        );
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = Math.pow(2, attempt - 1) * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }

  throw new Error('Fetch failed after all retries');
}
