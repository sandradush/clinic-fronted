import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, Settings, User, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="main-header">
      <div className="header-left">
      </div>

      <div className="header-right">
        <button className="header-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>

        <button className="header-btn">
          <Settings size={20} />
        </button>

        <div className="user-menu">
          <button 
            className="user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="user-avatar">
              <User size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-email">{user?.email}</span>
            </div>
            <ChevronDown size={16} />
          </button>
          
          {showDropdown && (
            <div className="user-dropdown">
              <div className="dropdown-header">
                <div className="user-avatar-large">
                  <User size={24} />
                </div>
                <div>
                  <div className="dropdown-name">{user?.name || 'User'}</div>
                  <div className="dropdown-email">{user?.email}</div>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <button onClick={logout} className="dropdown-item">
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;