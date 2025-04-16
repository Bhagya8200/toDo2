import React from 'react';
import { UserStats as UserStatsType } from '../../../../backend/src/entity/UserStats';

interface UserStatsProps {
  stats: UserStatsType | null;
  loading: boolean;
}

const UserStats: React.FC<UserStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-lg font-semibold mb-3">Your Stats</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
          <div className="text-sm text-gray-500">Total Points</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.tasksCompleted}</div>
          <div className="text-sm text-gray-500">Tasks Completed</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</div>
          <div className="text-sm text-gray-500">Current Streak</div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.longestStreak}</div>
          <div className="text-sm text-gray-500">Longest Streak</div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;