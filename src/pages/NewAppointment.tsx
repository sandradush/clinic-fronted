import React from 'react';
import { useTranslation } from 'react-i18next';

const NewAppointment: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="new-appointment">
      <h1>{t('newAppointment.title')}</h1>
      <p>{t('newAppointment.description')}</p>
      {/* Add appointment form components here */}
    </div>
  );
};

export default NewAppointment;
