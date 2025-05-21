import React, { useState } from "react";

interface ResetButtonProps {
  onReset: () => void;
}

const ResetButton: React.FC<ResetButtonProps> = ({ onReset }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleResetClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    onReset();
    setShowConfirmation(false);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
  };

  return (
    <div className="mb-6">
      <button
        onClick={handleResetClick}
        className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
      >
        Reset Everything
      </button>

      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 fade-in">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-center">Confirm Reset</h2>
            <p className="mb-6 text-center">
              This will delete all tasks, reset your stats to zero, and remove all badges.
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    // <></>
  );
};

export default ResetButton;
