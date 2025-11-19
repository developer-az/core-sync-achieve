const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTasks() {
  try {
    console.log('Express API: Fetching tasks from', API_BASE_URL);
    
    // Add timeout to detect sleeping Render service
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('Express API Response:', data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Express API: Request timed out (service may be sleeping)');
      throw new Error('Request timed out. Render service may be waking up - please try again in 30 seconds.');
    }
    console.error('Express API Error:', error);
    throw new Error(error.message || 'Failed to connect to Express API');
  }
}

export async function checkApiHealth() {
  try {
    console.log('Express API: Checking health at', API_BASE_URL);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    
    const res = await fetch(`${API_BASE_URL}/`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const data = await res.text();
    console.log('Express API Health Check:', data);
    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Express API: Health check timed out');
      throw new Error('Health check timed out. Service may be sleeping.');
    }
    console.error('Express API Health Check Failed:', error);
    throw error;
  }
}
