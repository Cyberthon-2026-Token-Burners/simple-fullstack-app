import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { TaskList } from './TaskList';

describe('TaskList', () => {
  describe('empty task list', () => {
    it('displays "No tasks yet." when tasks array is empty (acceptance example)', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <TaskList
          tasks={[]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });

    it('renders zero TaskItem components when tasks array is empty', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <TaskList
          tasks={[]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.queryAllByRole('checkbox');
      expect(checkboxes).toHaveLength(0);
    });

    it('does not render any delete buttons when tasks array is empty', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      render(
        <TaskList
          tasks={[]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const deleteButtons = screen.queryAllByRole('button');
      expect(deleteButtons).toHaveLength(0);
    });
  });

  describe('single task', () => {
    it('renders TaskItem for single task', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Single task',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Single task')).toBeInTheDocument();
    });

    it('does not display "No tasks yet." when there is one task', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Single task',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('No tasks yet.')).not.toBeInTheDocument();
    });

    it('renders exactly one checkbox for single task', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Single task',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(1);
    });
  });

  describe('multiple tasks', () => {
    it('renders TaskItem for each task in the array (acceptance example)', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'First task',
          completed: false,
        },
        {
          id: 't2',
          description: 'Second task',
          completed: true,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('First task')).toBeInTheDocument();
      expect(screen.getByText('Second task')).toBeInTheDocument();
    });

    it('renders exactly two TaskItem components when given two tasks', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'First task',
          completed: false,
        },
        {
          id: 't2',
          description: 'Second task',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(2);
    });

    it('renders exact number of tasks for varying array sizes', () => {
      const testCases = [
        { count: 1 },
        { count: 3 },
        { count: 5 },
        { count: 10 },
        { count: 50 },
      ];

      testCases.forEach(({ count }) => {
        const mockOnToggleStatus = vi.fn();
        const mockOnDelete = vi.fn();

        const tasks = Array.from({ length: count }, (_, i) => ({
          id: `t${i + 1}`,
          description: `Task ${i + 1}`,
          completed: i % 2 === 0,
        }));

        const { unmount } = render(
          <TaskList
            tasks={tasks}
            onToggleStatus={mockOnToggleStatus}
            onDelete={mockOnDelete}
          />
        );

        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(count);

        unmount();
      });
    });

    it('does not display "No tasks yet." when there are multiple tasks', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Task 1',
          completed: false,
        },
        {
          id: 't2',
          description: 'Task 2',
          completed: false,
        },
        {
          id: 't3',
          description: 'Task 3',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('No tasks yet.')).not.toBeInTheDocument();
    });
  });

  describe('callback delegation', () => {
    it('passes onToggleStatus callback to TaskItem components', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const tasks = [
        {
          id: 't1',
          description: 'Task 1',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      await user.click(checkbox);

      expect(mockOnToggleStatus).toHaveBeenCalledWith('t1', true);
    });

    it('passes onDelete callback to TaskItem components', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const tasks = [
        {
          id: 't1',
          description: 'Task 1',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledWith('t1');
    });

    it('correctly routes callbacks for multiple tasks with different ids', async () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();
      const user = userEvent.setup();

      const tasks = [
        {
          id: 't1',
          description: 'Task 1',
          completed: false,
        },
        {
          id: 't2',
          description: 'Task 2',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      await user.click(checkboxes[0]);
      expect(mockOnToggleStatus).toHaveBeenCalledWith('t1', true);

      await user.click(deleteButtons[1]);
      expect(mockOnDelete).toHaveBeenCalledWith('t2');
    });
  });

  describe('mixed task states', () => {
    it('renders tasks with mixed completed states correctly', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Incomplete task',
          completed: false,
        },
        {
          id: 't2',
          description: 'Completed task',
          completed: true,
        },
        {
          id: 't3',
          description: 'Another incomplete task',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Incomplete task')).toBeInTheDocument();
      expect(screen.getByText('Completed task')).toBeInTheDocument();
      expect(screen.getByText('Another incomplete task')).toBeInTheDocument();

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes[0].checked).toBe(false);
      expect(checkboxes[1].checked).toBe(true);
      expect(checkboxes[2].checked).toBe(false);
    });
  });

  describe('special task descriptions', () => {
    it('handles tasks with special characters in description', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Buy milk @store #urgent!',
          completed: false,
        },
        {
          id: 't2',
          description: 'Call 555-1234',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Buy milk @store #urgent!')).toBeInTheDocument();
      expect(screen.getByText('Call 555-1234')).toBeInTheDocument();
    });

    it('handles tasks with unicode characters', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Buy café ☕',
          completed: false,
        },
        {
          id: 't2',
          description: 'Learn мед 🍯',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Buy café ☕')).toBeInTheDocument();
      expect(screen.getByText('Learn мед 🍯')).toBeInTheDocument();
    });

    it('handles tasks with very long descriptions', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const longDescription = 'A'.repeat(500);

      const tasks = [
        {
          id: 't1',
          description: longDescription,
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(longDescription)).toBeInTheDocument();
    });
  });

  describe('task id variations', () => {
    it('renders tasks with different id formats', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        {
          id: 't1',
          description: 'Simple id',
          completed: false,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          description: 'UUID id',
          completed: false,
        },
        {
          id: 'task_id_123',
          description: 'Underscore id',
          completed: false,
        },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Simple id')).toBeInTheDocument();
      expect(screen.getByText('UUID id')).toBeInTheDocument();
      expect(screen.getByText('Underscore id')).toBeInTheDocument();
    });
  });

  describe('list re-rendering behavior', () => {
    it('handles list with all tasks incomplete', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        { id: 't1', description: 'Task 1', completed: false },
        { id: 't2', description: 'Task 2', completed: false },
        { id: 't3', description: 'Task 3', completed: false },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.checked).toBe(false);
      });
    });

    it('handles list with all tasks completed', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const tasks = [
        { id: 't1', description: 'Task 1', completed: true },
        { id: 't2', description: 'Task 2', completed: true },
      ];

      render(
        <TaskList
          tasks={tasks}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach((checkbox) => {
        expect(checkbox.checked).toBe(true);
      });
    });
  });

  describe('transition between empty and non-empty states', () => {
    it('renders "No tasks yet." when transitioning from populated to empty list', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const { rerender } = render(
        <TaskList
          tasks={[
            { id: 't1', description: 'Task 1', completed: false },
          ]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('Task 1')).toBeInTheDocument();

      rerender(
        <TaskList
          tasks={[]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('Task 1')).not.toBeInTheDocument();
      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();
    });

    it('renders tasks when transitioning from empty to populated list', () => {
      const mockOnToggleStatus = vi.fn();
      const mockOnDelete = vi.fn();

      const { rerender } = render(
        <TaskList
          tasks={[]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText('No tasks yet.')).toBeInTheDocument();

      rerender(
        <TaskList
          tasks={[
            { id: 't1', description: 'Task 1', completed: false },
            { id: 't2', description: 'Task 2', completed: false },
          ]}
          onToggleStatus={mockOnToggleStatus}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.queryByText('No tasks yet.')).not.toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });
});
