import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bell } from 'lucide-react';

const Header: React.FC = () => {
  const { t } = useTranslation();

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-40">
      <div className="flex items-center">
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center justify-center w-11 h-11 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-md transition-all duration-200 hover:-translate-y-0.5">
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};

export default Header;