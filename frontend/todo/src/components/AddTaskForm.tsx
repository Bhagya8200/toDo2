import React, { useState } from 'react';
import { TaskPriority } from '../shared/types';

interface AddTaskFormProps {
  onAdd: (title: string, description: string, priority: TaskPriority) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title, description, priority);
      setTitle('');
      setDescription('');
      setPriority(TaskPriority.MEDIUM);
      setIsExpanded(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            placeholder="What do you need to do?"
            className="form-input"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!isExpanded && e.target.value) {
                setIsExpanded(true);
              }
            }}
            onFocus={() => setIsExpanded(true)}
          />
        </div>

        {isExpanded && (
          <>
            <div className="mb-4">
              <textarea
                placeholder="Add details (optional)"
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="form-select"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>
          </>
        )}

        <div className="flex justify-end">
          {isExpanded && (
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="btn btn-secondary mr-2"
            >
              Cancel
            </button>
          )}
          <button type="submit" className="btn btn-primary">
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTaskForm;