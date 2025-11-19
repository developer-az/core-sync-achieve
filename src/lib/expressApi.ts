const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTasks() {
  try {
    console.log('Express API: Fetching tasks from', API_BASE_URL);
    const res = await fetch(`${API_BASE_URL}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    console.log('Express API Response:', data);
    return data;
  } catch (error) {
    console.error('Express API Error:', error);
    throw error;
  }
}

export async function checkApiHealth() {
  try {
    console.log('Express API: Checking health at', API_BASE_URL);
    const res = await fetch(`${API_BASE_URL}/`);
    const data = await res.text();
    console.log('Express API Health Check:', data);
    return data;
  } catch (error) {
    console.error('Express API Health Check Failed:', error);
    throw error;
  }
}
