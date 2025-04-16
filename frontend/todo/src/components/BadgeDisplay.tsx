import React, { useState } from 'react';
import { Badge } from '../../../../backend/src/entity/Badge';

interface BadgeDisplayProps {
  badges: Badge[];
  loading: boolean;
}

const BadgeDisplay: React.FC<BadgeDisplayProps> = ({ badges, loading }) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  if (loading) {
    return <div className="animate-pulse h-32 bg-gray-200 rounded-lg"></div>;
  }

  if (badges.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-2">Badges</h2>
        <p className="text-gray-500">Complete tasks to earn badges!</p>
      </div>
    );
  }

  const handleBadgeClick = (badge: Badge) => {
    setSelectedBadge(badge);
  };

  const handleCloseModal = () => {
    setSelectedBadge(null);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-3">Your Badges ({badges.length})</h2>
      <div className="flex flex-wrap gap-3">
        {badges.map((badge) => (
          <div
            key={badge.id}
            onClick={() => handleBadgeClick(badge)}
            className="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg p-2 flex flex-col items-center w-20 h-20"
          >
            <div className="text-2xl mb-1">{badge.imageUrl.includes('first') ? '🌟' : 
                               badge.imageUrl.includes('start') ? '🚀' : 
                               badge.imageUrl.includes('roll') ? '🎯' : 
                               badge.imageUrl.includes('master') ? '🏆' : 
                               badge.imageUrl.includes('guru') ? '👑' : 
                               badge.imageUrl.includes('centurion') ? '💯' : 
                               badge.imageUrl.includes('consistent') ? '📅' : 
                               badge.imageUrl.includes('weekly') ? '🗓️' : 
                               badge.imageUrl.includes('fortnight') ? '📆' : 
                               badge.imageUrl.includes('monthly') ? '🏅' : 
                               badge.imageUrl.includes('century') ? '💯' : 
                               badge.imageUrl.includes('achiever') ? '🎖️' : 
                               badge.imageUrl.includes('millennial') ? '💎' : '🏅'}</div>
            <div className="text-xs text-center truncate w-full" title={badge.name}>
              {badge.name}
            </div>
          </div>
        ))}
      </div>

      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in" onClick={handleCloseModal}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-5xl mb-3 inline-block">{selectedBadge.imageUrl.includes('first') ? '🌟' : 
                               selectedBadge.imageUrl.includes('start') ? '🚀' : 
                               selectedBadge.imageUrl.includes('roll') ? '🎯' : 
                               selectedBadge.imageUrl.includes('master') ? '🏆' : 
                               selectedBadge.imageUrl.includes('guru') ? '👑' : 
                               selectedBadge.imageUrl.includes('centurion') ? '💯' : 
                               selectedBadge.imageUrl.includes('consistent') ? '📅' : 
                               selectedBadge.imageUrl.includes('weekly') ? '🗓️' : 
                               selectedBadge.imageUrl.includes('fortnight') ? '📆' : 
                               selectedBadge.imageUrl.includes('monthly') ? '🏅' : 
                               selectedBadge.imageUrl.includes('century') ? '💯' : 
                               selectedBadge.imageUrl.includes('achiever') ? '🎖️' : 
                               selectedBadge.imageUrl.includes('millennial') ? '💎' : '🏅'}</div>
              <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
              <p className="text-gray-500">{selectedBadge.description}</p>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Requirement:</div>
              <div className="text-gray-600">{selectedBadge.requirement}</div>
            </div>
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-1">Earned:</div>
              <div className="text-gray-600">
                {selectedBadge.earnedAt ? new Date(selectedBadge.earnedAt).toLocaleDateString() : 'Not earned yet'}
              </div>
            </div>
            <div className="flex justify-center">
              <button onClick={handleCloseModal} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeDisplay;