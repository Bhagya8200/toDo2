import React from 'react';
import { MoodType } from '../../src/shared/types';

interface CompletionMoodModalProps {
  onSelect: (mood: MoodType) => void;
  onCancel: () => void;
}

const CompletionMoodModal: React.FC<CompletionMoodModalProps> = ({ onSelect, onCancel }) => {
  const moods = [
    { type: MoodType.AWESOME, emoji: '😁', label: 'Awesome' },
    { type: MoodType.GOOD, emoji: '🙂', label: 'Good' },
    { type: MoodType.NEUTRAL, emoji: '😐', label: 'Neutral' },
    { type: MoodType.BAD, emoji: '🙁', label: 'Bad' },
    { type: MoodType.TERRIBLE, emoji: '😫', label: 'Terrible' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">How do you feel after completing this task?</h2>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {moods.map((mood) => (
            <button
              key={mood.type}
              onClick={() => onSelect(mood.type)}
              className="flex flex-col items-center justify-center p-3 rounded-lg hover:bg-gray-100"
            >
              <span className="text-4xl mb-2">{mood.emoji}</span>
              <span className="text-sm">{mood.label}</span>
            </button>
          ))}
        </div>
        <div className="flex justify-center">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionMoodModal;