import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="main-header">
      <div className="header-left">
      </div>

      <div className="header-right">
        <button className="header-btn">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;