import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskItem } from './TaskItem';

describe('TaskItem', () => {
  describe('props rendering', () => {
    const defaultTask = {
      id: 't1',
      description: 'Buy groceries',
      completed: false,
    };

    it('renders task description', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      render(
        <TaskItem
          task={defaultTask}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText('Buy groceries')).toBeInTheDocument();
    });

    it('renders a checkbox input', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      render(
        <TaskItem
          task={defaultTask}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toBeInTheDocument();
    });

    it('renders a delete button', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      render(
        <TaskItem
          task={defaultTask}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    });

    it('sets checkbox checked state based on task.completed property', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const completedTask = {
        id: 't1',
        description: 'Done task',
        completed: true,
      };
      render(
        <TaskItem
          task={completedTask}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(true);
    });

    it('sets checkbox unchecked state when task.completed is false', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const incompleteTask = {
        id: 't1',
        description: 'Not done task',
        completed: false,
      };
      render(
        <TaskItem
          task={incompleteTask}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );
      const checkbox = screen.getByRole('checkbox');
      expect(checkbox.checked).toBe(false);
    });
  });

  describe('toggle completion status', () => {
    const testCases = [
      {
        name: 'toggle from false to true',
        taskId: 't1',
        initialCompleted: false,
        expectedNewStatus: true,
      },
      {
        name: 'toggle from true to false',
        taskId: 't2',
        initialCompleted: true,
        expectedNewStatus: false,
      },
      {
        name: 'toggle with numeric-like string id',
        taskId: '123',
        initialCompleted: false,
        expectedNewStatus: true,
      },
      {
        name: 'toggle with UUID-format id',
        taskId: '550e8400-e29b-41d4-a716-446655440000',
        initialCompleted: false,
        expectedNewStatus: true,
      },
      {
        name: 'toggle with hyphenated id',
        taskId: 'task-id-123',
        initialCompleted: true,
        expectedNewStatus: false,
      },
    ];

    it.each(testCases)(
      'calls onToggleStatus with correct args: $name',
      async ({ taskId, initialCompleted, expectedNewStatus }) => {
        const mockOnToggleStatus = vi.fn();
        const mockOnDelete = vi.fn();
        const user = userEvent.setup();

        const task = {
          id: taskId,
          description: 'Test task',
          completed: initialCompleted,
        };

        render(
          <TaskItem
            task={task}
            onToggleStatus={mockOnToggleStatus}
            onDelete={mockOnDelete}
          />
        );

        const checkbox = screen.getByRole('checkbox');
        await user.click(checkbox);

        expect(mockOnToggleStatus).toHaveBeenCalledWith(taskId, expectedNewStatus);
      }
    );

    it('calls onToggleStatus when user clicks checkbox (acceptance example)', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: 't1',
        description: 'Sample task',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnToggleStatus).toHaveBeenCalledWith('t1', true);
    });

    it('calls onToggleStatus with task id and new status (false)', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: 't1',
        description: 'Sample task',
        completed: true,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnToggleStatus).toHaveBeenCalledWith('t1', false);
    });
  });

  describe('delete task', () => {
    const testCases = [
      {
        name: 'delete task with simple id',
        taskId: 't1',
      },
      {
        name: 'delete task with numeric id string',
        taskId: '42',
      },
      {
        name: 'delete task with UUID',
        taskId: '550e8400-e29b-41d4-a716-446655440000',
      },
      {
        name: 'delete task with hyphenated id',
        taskId: 'task-uuid-123',
      },
      {
        name: 'delete task with underscore id',
        taskId: 'task_id_001',
      },
    ];

    it.each(testCases)('calls onDelete with correct task id: $name', async ({ taskId }) => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: taskId,
        description: 'Task to delete',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith(taskId);
    });

    it('calls onDelete with task id when user clicks delete button (acceptance example)', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: 't2',
        description: 'Task to delete',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('t2');
    });

    it('does not call onToggleStatus when delete button is clicked', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: 't1',
        description: 'Task to delete',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnToggleStatus).not.toHaveBeenCalled();
    });
  });

  describe('visual state', () => {
    it('applies strikethrough style when task is completed', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const task = {
        id: 't1',
        description: 'Completed task',
        completed: true,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const taskDescription = screen.getByText('Completed task');
      expect(taskDescription).toHaveStyle('text-decoration: line-through');
    });

    it('does not apply strikethrough style when task is not completed', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const task = {
        id: 't1',
        description: 'Incomplete task',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const taskDescription = screen.getByText('Incomplete task');
      expect(taskDescription).toHaveStyle('text-decoration: none');
    });
  });

  describe('task descriptions with special content', () => {
    const descriptionCases = [
      {
        name: 'description with special characters',
        description: 'Buy milk @store #urgent!',
      },
      {
        name: 'description with numbers',
        description: 'Task 123',
      },
      {
        name: 'very long description',
        description: 'A'.repeat(500),
      },
      {
        name: 'description with unicode characters',
        description: 'Buy café ☕ and мед 🍯',
      },
    ];

    it.each(descriptionCases)('renders task correctly: $name', ({ description }) => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const task = {
        id: 't1',
        description,
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(description)).toBeInTheDocument();
    });
  });

  describe('independent callback invocations', () => {
    it('invokes callbacks independently when both toggle and delete are clicked', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const task = {
        id: 't1',
        description: 'Test task',
        completed: false,
      };

      render(
        <TaskItem
          task={task}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      const deleteButton = screen.getByRole('button', { name: /delete/i });

      await user.click(checkbox);
      await user.click(deleteButton);

      expect(mockOnToggleStatus).toHaveBeenCalledTimes(1);
      expect(mockOnDelete).toHaveBeenCalledTimes(1);
      expect(mockOnToggleStatus).toHaveBeenCalledWith('t1', true);
      expect(mockOnDelete).toHaveBeenCalledWith('t1');
    });
  });
});
