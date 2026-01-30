import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { useTranslation } from 'react-i18next';

const OfflineIndicator: React.FC = () => {
  const { isOnline } = useOffline();
  const { t } = useTranslation();

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <span>{t('offline.message')}</span>
    </div>
  );
};

export default OfflineIndicator;
