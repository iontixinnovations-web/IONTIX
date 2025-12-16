import { Lock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ChatUser } from './data';
import { THEMES } from './data';

interface ChatListItemProps {
  chat: ChatUser;
  onClick: () => void;
  isActive?: boolean;
}

export function ChatListItem({ chat, onClick, isActive = false }: ChatListItemProps) {
  const isHidden = chat.isHidden;
  const theme = THEMES[chat.tab];
  const isOnline = chat.status === 'Online';
  const glowRingClass = isOnline
    ? 'p-0.5 bg-gradient-to-tr from-pink-500 to-amber-500 rounded-full'
    : 'p-0';

  const handleClick = () => {
    if (isHidden) {
      toast.info('Biometric/Face ID required to unlock Hidden Chat');
    } else {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-center p-3 rounded-xl transition ${
        isActive ? 'bg-gray-100 shadow-inner' : 'hover:bg-gray-50'
      } ${isHidden ? 'opacity-70 italic' : ''}`}
      disabled={isHidden}
    >
      <div className={glowRingClass}>
        <div className="relative bg-white rounded-full">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-md ${chat.avatarColor}`}
          >
            {isHidden ? <Lock size={20} /> : chat.name[0]}
          </div>
          {!isHidden && (
            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}
            ></span>
          )}
        </div>
      </div>
      <div className="ml-3 text-left flex-1 min-w-0">
        <div className="text-gray-800 flex items-center truncate">
          {chat.name}
          {chat.verified && <span className="ml-1 text-xs text-xl">💎</span>}
        </div>
        <p className="text-sm text-gray-500 truncate">
          {isHidden ? 'Locked. Tap to view.' : chat.lastMessage}
        </p>
      </div>
      <div className="text-xs text-gray-400 ml-2">{!isHidden && (isOnline ? 'NOW' : 'YESTERDAY')}</div>
    </button>
  );
}
