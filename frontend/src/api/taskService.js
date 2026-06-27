import axios from 'axios';

/**
 * A Task object returned from the API.
 * @typedef {{id: string, description: string, completed: boolean}} Task
 */

// A single, configured Axios instance for all API calls.
// It must be configured with `baseURL: '/api'`.
const apiClient = axios.create({
  baseURL: '/api',
});

/**
 * Fetches all tasks from the server.
 * @returns {Promise<Task[]>} A promise that resolves to an array of tasks.
 * @throws {Error} Propagates an error if the API request fails.
 */
export async function getTasks() {
  const response = await apiClient.get('/tasks/');
  return response.data;
}

/**
 * Creates a new task.
 * @param {string} description - The description of the new task.
 * @returns {Promise<Task>} A promise that resolves to the newly created task.
 * @throws {Error} Propagates an error if the API request fails.
 */
export async function createTask(description) {
  const response = await apiClient.post('/tasks/', { description });
  return response.data;
}

/**
 * Updates a task's completion status.
 * @param {string} taskId - The ID of the task to update.
 * @param {boolean} completed - The new completion status.
 * @returns {Promise<Task>} A promise that resolves to the updated task.
 * @throws {Error} Propagates an error if the API request fails.
 */
export async function updateTask(taskId, completed) {
  const response = await apiClient.patch(`/tasks/${taskId}`, { completed });
  return response.data;
}

/**
 * Deletes a task.
 * @param {string} taskId - The ID of the task to delete.
 * @returns {Promise<void>} A promise that resolves when the deletion is successful.
 * @throws {Error} Propagates an error if the API request fails.
 */
export async function deleteTask(taskId) {
  await apiClient.delete(`/tasks/${taskId}`);
}
