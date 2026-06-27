import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AddTaskForm } from './AddTaskForm';

describe('AddTaskForm', () => {
  describe('form rendering', () => {
    it('renders a text input field', () => {
      const mockOnAddTask = vi.fn();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);
      expect(screen.getByPlaceholderText('Add a new task...')).toBeInTheDocument();
    });

    it('renders a submit button', () => {
      const mockOnAddTask = vi.fn();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);
      expect(screen.getByRole('button', { name: /add task/i })).toBeInTheDocument();
    });

    it('initializes with an empty input field', () => {
      const mockOnAddTask = vi.fn();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);
      const input = screen.getByPlaceholderText('Add a new task...');
      expect(input.value).toBe('');
    });
  });

  describe('form submission behavior', () => {
    const testCases = [
      {
        name: 'single word task',
        input: 'Groceries',
        expected: 'Groceries',
      },
      {
        name: 'multi-word task',
        input: 'A new task',
        expected: 'A new task',
      },
      {
        name: 'task with special characters',
        input: 'Buy milk @store #urgent!',
        expected: 'Buy milk @store #urgent!',
      },
      {
        name: 'task with numbers',
        input: 'Task 123',
        expected: 'Task 123',
      },
      {
        name: 'task with leading spaces trimmed',
        input: '   Task with leading spaces',
        expected: 'Task with leading spaces',
      },
      {
        name: 'task with trailing spaces trimmed',
        input: 'Task with trailing spaces   ',
        expected: 'Task with trailing spaces',
      },
      {
        name: 'task with leading and trailing spaces trimmed',
        input: '   Task with spaces   ',
        expected: 'Task with spaces',
      },
      {
        name: 'very long task description',
        input: 'A'.repeat(250),
        expected: 'A'.repeat(250),
      },
      {
        name: 'task with unicode characters',
        input: 'Buy café ☕ and мед 🍯',
        expected: 'Buy café ☕ and мед 🍯',
      },
    ];

    it.each(testCases)('calls onAddTask with correct description: $name', async ({ input, expected }) => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input_field = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input_field, input);
      await user.click(submitButton);

      expect(mockOnAddTask).toHaveBeenCalledWith(expected);
    });

    it('calls onAddTask with trimmed input when user submits form', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, '   A new task   ');
      await user.click(submitButton);

      expect(mockOnAddTask).toHaveBeenCalledWith('A new task');
    });

    it('clears input field after successful submission', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, 'Test task');
      await user.click(submitButton);

      expect(input.value).toBe('');
    });

    it('does not call onAddTask with whitespace-only input', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, '   ');
      await user.click(submitButton);

      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('does not call onAddTask with empty input', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.click(submitButton);

      expect(mockOnAddTask).not.toHaveBeenCalled();
    });

    it('does not clear input field when submission is blocked (whitespace only)', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, '   ');
      await user.click(submitButton);

      expect(input.value).toBe('   ');
    });

    it('allows multiple form submissions sequentially', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, 'First task');
      await user.click(submitButton);

      await user.type(input, 'Second task');
      await user.click(submitButton);

      expect(mockOnAddTask).toHaveBeenCalledTimes(2);
      expect(mockOnAddTask).toHaveBeenNthCalledWith(1, 'First task');
      expect(mockOnAddTask).toHaveBeenNthCalledWith(2, 'Second task');
    });
  });

  describe('form submission via Enter key', () => {
    it('submits form when Enter key is pressed', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');

      await user.type(input, 'Task via Enter{Enter}');

      expect(mockOnAddTask).toHaveBeenCalledWith('Task via Enter');
    });

    it('clears input field when submitting via Enter key', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');

      await user.type(input, 'Task{Enter}');

      expect(input.value).toBe('');
    });
  });

  describe('input state management', () => {
    it('updates input value as user types', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');

      await user.type(input, 'T');
      expect(input.value).toBe('T');

      await user.type(input, 'ask');
      expect(input.value).toBe('Task');
    });

    it('handles rapid form submissions correctly', async () => {
      const mockOnAddTask = vi.fn();
      const user = userEvent.setup();
      render(<AddTaskForm onAddTask={mockOnAddTask} />);

      const input = screen.getByPlaceholderText('Add a new task...');
      const submitButton = screen.getByRole('button', { name: /add task/i });

      await user.type(input, 'Task 1');
      await user.click(submitButton);
      await user.type(input, 'Task 2');
      await user.click(submitButton);
      await user.type(input, 'Task 3');
      await user.click(submitButton);

      expect(mockOnAddTask).toHaveBeenCalledTimes(3);
    });
  });
});
