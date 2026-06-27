export function TaskItem({ task, onToggleStatus, onDelete }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <input
        type="checkbox"
        checked={task.completed}
        onChange={(e) => onToggleStatus(task.id, e.target.checked)}
      />
      <span style={{ textDecoration: task.completed ? 'line-through' : 'none' }}>
        {task.description}
      </span>
      <button onClick={() => onDelete(task.id)}>Delete</button>
    </div>
  );
}
