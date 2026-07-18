/**
 * Utility helper to perform network requests with automatic retry and exponential backoff.
 * This ensures high resilience against transient startup lags, server restarts, or brief network hiccups.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 4,
  delay = 1000
): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Only retry on server-side errors (5xx). 4xx client errors are expected logic flows
    // (e.g. 401 unauthorized, 404 not found) and should not be retried.
    if (!response.ok) {
      if (response.status >= 500 && response.status < 600) {
        throw new Error(`Server error with status code: ${response.status}`);
      }
      return response;
    }
    
    return response;
  } catch (error: any) {
    const isNetworkError = error instanceof TypeError || error.message?.includes('Failed to fetch') || error.message?.includes('network');
    const isServerError = error.message?.includes('Server error');

    if ((isNetworkError || isServerError) && retries > 0) {
      console.warn(`[Network] Fetch failed for ${url}. Retrying in ${delay}ms... (${retries} retries left). Info: ${error.message || error}`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 1.5);
    }
    
    throw error;
  }
}
