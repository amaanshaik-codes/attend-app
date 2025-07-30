import React from 'react';

interface SyncStatusProps {
  isSaving: boolean;
  lastSync: Date | null;
  error: string | null;
}

const SyncStatus: React.FC<SyncStatusProps> = ({ isSaving, lastSync, error }) => {
  if (error) {
    return <span className="text-red-500">{error}</span>;
  }
  if (isSaving) {
    return <span className="text-yellow-500">Saving...</span>;
  }
  if (lastSync) {
    return <span className="text-green-500">All changes saved at {lastSync.toLocaleTimeString()}</span>;
  }
  return <span className="text-gray-400">Ready</span>;
};

export default SyncStatus;
