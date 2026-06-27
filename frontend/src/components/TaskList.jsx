import { TaskItem } from './TaskItem';

export function TaskList({ tasks, onToggleStatus, onDelete }) {
  if (tasks.length === 0) {
    return <div>No tasks yet.</div>;
  }

  return (
    <div>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
