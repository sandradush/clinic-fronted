import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { useTranslation } from 'react-i18next';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOffline();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-2 px-4 z-[9999] text-sm font-medium">
      <span>{t('offline.message')}</span>
    </div>
  );
};

export default OfflineIndicator;
