import { useState } from 'react';
import { Gem, User, Settings, Package, LogOut, Bell, Search } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { GlobalSearch } from './GlobalSearch';

interface HeaderProps {
  onNavigateToProfile?: () => void;
}

export function Header({ onNavigateToProfile }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const glowCoins = 450;
  const hasUnreadNotifications = true;

  const handleProfileAction = (action: string) => {
    setShowDropdown(false);
    if (action === 'My Account' && onNavigateToProfile) {
      onNavigateToProfile();
    } else {
      console.log(`Profile action: ${action}`);
    }
  };

  return (
    <>
      <header className="p-4 flex justify-between items-start sticky top-0 z-10 backdrop-blur-sm shadow-lg shadow-gray-200 bg-white/80 border-b border-white/50">
        <h1 className="text-3xl text-transparent bg-clip-text glow-accent">GLOW</h1>

        <div className="flex space-x-3 items-center">
          {/* Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="w-10 h-10 rounded-full bg-gray-100 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="Search"
          >
            <Search className="w-5 h-5 text-gray-600" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative w-10 h-10 rounded-full bg-gray-100 shadow-lg flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {hasUnreadNotifications && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          {/* Glow Coins */}
          <button
            onClick={() => console.log('Rewards modal')}
            className="flex items-center p-1 px-3 bg-white border border-yellow-400 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
            aria-label="Glow Coins"
          >
            <Gem className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm text-gray-800">{glowCoins}</span>
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-pink-500 shadow-lg flex items-center justify-center transition-transform hover:scale-105"
              aria-label="User Profile"
            >
              <User className="w-5 h-5 text-white" />
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl p-3 transform origin-top-right transition-transform duration-200 z-50 border border-gray-100 ${
                showDropdown ? 'scale-100' : 'scale-0'
              }`}
            >
              <p className="text-sm text-gray-800 mb-2 border-b border-gray-200 pb-2">
                Jane Doe
              </p>
              <button
                onClick={() => handleProfileAction('My Account')}
                className="flex items-center w-full p-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 mr-2" /> My Account
              </button>
              <button
                onClick={() => handleProfileAction('My Orders')}
                className="flex items-center w-full p-2 text-sm text-gray-600 hover:text-pink-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Package className="w-4 h-4 mr-2" /> My Orders
              </button>
              <button
                onClick={() => handleProfileAction('Logout')}
                className="flex items-center w-full p-2 text-sm text-red-600 hover:bg-gray-50 rounded-lg transition-colors mt-1"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modals */}
      <NotificationCenter
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
      
      <GlobalSearch
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
      />
    </>
  );
}
