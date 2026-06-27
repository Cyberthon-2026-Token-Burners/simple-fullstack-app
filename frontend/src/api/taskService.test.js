import { describe, it, expect, beforeEach, vi } from 'vitest';

var mockInstance;

vi.mock('axios', () => {
  mockInstance = {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  };
  return {
    default: {
      create: vi.fn(() => mockInstance),
    },
  };
});

import * as taskService from './taskService';

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTasks', () => {
    const testCases = [
      {
        name: 'empty task list',
        responseData: [],
      },
      {
        name: 'single task',
        responseData: [
          { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Task 1', completed: false },
        ],
      },
      {
        name: 'multiple tasks',
        responseData: [
          { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Task 1', completed: false },
          { id: '223e4567-e89b-12d3-a456-426614174001', description: 'Task 2', completed: true },
          { id: '323e4567-e89b-12d3-a456-426614174002', description: 'Task 3', completed: false },
        ],
      },
      {
        name: 'tasks with various descriptions',
        responseData: [
          { id: '123e4567-e89b-12d3-a456-426614174000', description: 'A', completed: false },
          { id: '223e4567-e89b-12d3-a456-426614174001', description: 'x'.repeat(256), completed: true },
          { id: '323e4567-e89b-12d3-a456-426614174002', description: 'Task with special chars: @#$%', completed: false },
        ],
      },
    ];

    for (const tc of testCases) {
      it(`returns tasks when ${tc.name}`, async () => {
        mockInstance.get.mockResolvedValue({ data: tc.responseData });

        const result = await taskService.getTasks();

        expect(mockInstance.get).toHaveBeenCalledWith('/tasks/');
        expect(result).toEqual(tc.responseData);
      });
    }

    it('propagates error on non-2xx response', async () => {
      const error = new Error('Network error');
      mockInstance.get.mockRejectedValue(error);

      await expect(taskService.getTasks()).rejects.toThrow(Error);
    });
  });

  describe('createTask', () => {
    const testCases = [
      {
        name: 'single character description',
        description: 'A',
        expectedBody: { description: 'A' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'A', completed: false },
      },
      {
        name: 'typical task description',
        description: 'Buy groceries',
        expectedBody: { description: 'Buy groceries' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Buy groceries', completed: false },
      },
      {
        name: 'long description at max boundary',
        description: 'x'.repeat(256),
        expectedBody: { description: 'x'.repeat(256) },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'x'.repeat(256), completed: false },
      },
      {
        name: 'description with spaces',
        description: '  Task with spaces  ',
        expectedBody: { description: '  Task with spaces  ' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: '  Task with spaces  ', completed: false },
      },
      {
        name: 'description with special characters',
        description: 'Task with !@#$%^&*()',
        expectedBody: { description: 'Task with !@#$%^&*()' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Task with !@#$%^&*()', completed: false },
      },
      {
        name: 'description with unicode characters',
        description: 'Tâche avec des caractères spéciaux 日本語',
        expectedBody: { description: 'Tâche avec des caractères spéciaux 日本語' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Tâche avec des caractères spéciaux 日本語', completed: false },
      },
      {
        name: 'description with newlines',
        description: 'Line 1\nLine 2\nLine 3',
        expectedBody: { description: 'Line 1\nLine 2\nLine 3' },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Line 1\nLine 2\nLine 3', completed: false },
      },
    ];

    for (const tc of testCases) {
      it(`creates task with ${tc.name}`, async () => {
        mockInstance.post.mockResolvedValue({ data: tc.responseData });

        const result = await taskService.createTask(tc.description);

        expect(mockInstance.post).toHaveBeenCalledWith('/tasks/', tc.expectedBody);
        expect(result).toEqual(tc.responseData);
      });
    }

    it('propagates error on non-2xx response', async () => {
      const error = new Error('Validation error');
      mockInstance.post.mockRejectedValue(error);

      await expect(taskService.createTask('A task')).rejects.toThrow(Error);
    });
  });

  describe('updateTask', () => {
    const testCases = [
      {
        name: 'mark task as completed',
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        completed: true,
        expectedUrl: '/tasks/123e4567-e89b-12d3-a456-426614174000',
        expectedBody: { completed: true },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Task', completed: true },
      },
      {
        name: 'mark task as incomplete',
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        completed: false,
        expectedUrl: '/tasks/123e4567-e89b-12d3-a456-426614174000',
        expectedBody: { completed: false },
        responseData: { id: '123e4567-e89b-12d3-a456-426614174000', description: 'Task', completed: false },
      },
      {
        name: 'simple UUID format',
        taskId: 'simple-id-123',
        completed: true,
        expectedUrl: '/tasks/simple-id-123',
        expectedBody: { completed: true },
        responseData: { id: 'simple-id-123', description: 'Task', completed: true },
      },
      {
        name: 'numeric task ID',
        taskId: '456',
        completed: false,
        expectedUrl: '/tasks/456',
        expectedBody: { completed: false },
        responseData: { id: '456', description: 'Task', completed: false },
      },
    ];

    for (const tc of testCases) {
      it(`updates task to ${tc.name}`, async () => {
        mockInstance.patch.mockResolvedValue({ data: tc.responseData });

        const result = await taskService.updateTask(tc.taskId, tc.completed);

        expect(mockInstance.patch).toHaveBeenCalledWith(tc.expectedUrl, tc.expectedBody);
        expect(result).toEqual(tc.responseData);
      });
    }

    it('propagates error on non-2xx response', async () => {
      const error = new Error('Not found');
      mockInstance.patch.mockRejectedValue(error);

      await expect(taskService.updateTask('invalid-id', true)).rejects.toThrow(Error);
    });
  });

  describe('deleteTask', () => {
    const testCases = [
      {
        name: 'delete task with UUID',
        taskId: '123e4567-e89b-12d3-a456-426614174000',
        expectedUrl: '/tasks/123e4567-e89b-12d3-a456-426614174000',
      },
      {
        name: 'delete task with simple ID',
        taskId: 'task-id-1',
        expectedUrl: '/tasks/task-id-1',
      },
      {
        name: 'delete task with numeric ID',
        taskId: '999',
        expectedUrl: '/tasks/999',
      },
    ];

    for (const tc of testCases) {
      it(`${tc.name}`, async () => {
        mockInstance.delete.mockResolvedValue({});

        await taskService.deleteTask(tc.taskId);

        expect(mockInstance.delete).toHaveBeenCalledWith(tc.expectedUrl);
      });
    }

    it('propagates error on non-2xx response', async () => {
      const error = new Error('Not found');
      mockInstance.delete.mockRejectedValue(error);

      await expect(taskService.deleteTask('nonexistent-id')).rejects.toThrow(Error);
    });
  });

  describe('error handling across all functions', () => {
    const errorCases = [
      {
        name: 'HTTP 404',
        error: new Error('404 Not Found'),
      },
      {
        name: 'HTTP 400',
        error: new Error('400 Bad Request'),
      },
      {
        name: 'HTTP 500',
        error: new Error('500 Server Error'),
      },
      {
        name: 'network timeout',
        error: new Error('timeout'),
      },
      {
        name: 'ECONNREFUSED',
        error: new Error('ECONNREFUSED'),
      },
    ];

    for (const errorCase of errorCases) {
      it(`getTasks propagates error on ${errorCase.name}`, async () => {
        mockInstance.get.mockRejectedValue(errorCase.error);
        await expect(taskService.getTasks()).rejects.toThrow(Error);
      });

      it(`createTask propagates error on ${errorCase.name}`, async () => {
        mockInstance.post.mockRejectedValue(errorCase.error);
        await expect(taskService.createTask('test')).rejects.toThrow(Error);
      });

      it(`updateTask propagates error on ${errorCase.name}`, async () => {
        mockInstance.patch.mockRejectedValue(errorCase.error);
        await expect(taskService.updateTask('id', true)).rejects.toThrow(Error);
      });

      it(`deleteTask propagates error on ${errorCase.name}`, async () => {
        mockInstance.delete.mockRejectedValue(errorCase.error);
        await expect(taskService.deleteTask('id')).rejects.toThrow(Error);
      });
    }
  });

  describe('request body validation', () => {
    it('createTask passes description as-is without coercion', async () => {
      mockInstance.post.mockResolvedValue({ data: { id: '123', description: '0', completed: false } });

      await taskService.createTask('0');

      const callArgs = mockInstance.post.mock.calls[0];
      expect(callArgs[1]).toEqual({ description: '0' });
    });

    it('updateTask passes completed as-is without coercion', async () => {
      mockInstance.patch.mockResolvedValue({ data: { id: '123', description: 'Task', completed: true } });

      await taskService.updateTask('123', true);

      const callArgs = mockInstance.patch.mock.calls[0];
      expect(callArgs[1]).toEqual({ completed: true });
    });

    it('updateTask passes false completed value', async () => {
      mockInstance.patch.mockResolvedValue({ data: { id: '123', description: 'Task', completed: false } });

      await taskService.updateTask('123', false);

      const callArgs = mockInstance.patch.mock.calls[0];
      expect(callArgs[1]).toEqual({ completed: false });
    });
  });
});
