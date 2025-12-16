import { useState } from 'react';
import { Search, Phone, Clock3, Camera, MessageSquare, Settings, Calendar } from 'lucide-react';
import type { ChatUser, ChatTab, MessengerSubTab } from './data';
import { MOCK_DATA, THEMES } from './data';
import { ChatListItem } from './ChatListItem';

interface ChatListProps {
  currentTab: ChatTab;
  onOpenChat: (user: ChatUser) => void;
  onOpenSettings: () => void;
}

export function ChatList({ currentTab, onOpenChat, onOpenSettings }: ChatListProps) {
  const [messengerSubTab, setMessengerSubTab] = useState<MessengerSubTab>('primary');
  const theme = THEMES[currentTab];

  if (currentTab === 'contacts') {
    const chats = MOCK_DATA.contacts;
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="p-4 border-b border-gray-100">
          <h2 className={`text-2xl ${theme.secondary}`}>Glow Contact</h2>
          <div className="flex items-center mt-3 p-3 border border-gray-300 rounded-full focus-within:ring-2 focus-within:ring-purple-300">
            <Search size={20} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search Contacts..." className="flex-1 outline-none" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} onClick={() => onOpenChat(chat)} />
          ))}
        </div>
        <div className="flex justify-around p-3 border-t border-gray-100 bg-white shadow-lg">
          <button className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition">
            <Phone size={24} /> <span className="text-xs mt-1">Calls</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition">
            <Clock3 size={24} /> <span className="text-xs mt-1">Status</span>
          </button>
          <button className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition">
            <Camera size={24} /> <span className="text-xs mt-1">Camera</span>
          </button>
          <button className="flex flex-col items-center text-purple-600 transition">
            <MessageSquare size={24} /> <span className="text-xs mt-1">Chats</span>
          </button>
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center text-gray-500 hover:text-purple-600 transition"
          >
            <Settings size={24} /> <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </div>
    );
  }

  if (currentTab === 'messenger') {
    const primaryChats = MOCK_DATA.messenger.primary;
    const requestChats = MOCK_DATA.messenger.requests;
    const currentChats = messengerSubTab === 'primary' ? primaryChats : requestChats;

    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="p-4 border-b border-gray-100">
          <h2 className={`text-2xl ${theme.secondary}`}>Glow Messenger</h2>
          <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
            <span>
              Followers: <span>{primaryChats[0].followers}</span>
            </span>
            <span>
              Requests: <span className="text-red-500">{requestChats.length}</span>
            </span>
          </div>
        </header>

        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setMessengerSubTab('primary')}
            className={`flex-1 p-3 text-center transition ${
              messengerSubTab === 'primary'
                ? `${theme.secondary} border-b-2 border-pink-500`
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Primary
          </button>
          <button
            onClick={() => setMessengerSubTab('requests')}
            className={`flex-1 p-3 text-center transition relative ${
              messengerSubTab === 'requests'
                ? `${theme.secondary} border-b-2 border-pink-500`
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Requests
            {requestChats.length > 0 && (
              <span className="absolute top-1 right-8 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {requestChats.length}
              </span>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {currentChats.length > 0 ? (
            currentChats.map((chat) => (
              <ChatListItem key={chat.id} chat={chat} onClick={() => onOpenChat(chat)} />
            ))
          ) : (
            <div className="text-center p-10 text-gray-400">No chats here.</div>
          )}
        </div>
      </div>
    );
  }

  if (currentTab === 'artist') {
    const chats = MOCK_DATA.artist;
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-white">
        <header className="p-4 border-b border-gray-100">
          <h2 className={`text-2xl ${theme.secondary}`}>Glow Artist Bookings</h2>
          <div className="flex items-center mt-3 p-3 border border-gray-300 rounded-full focus-within:ring-2 focus-within:ring-amber-300">
            <Calendar size={20} className="text-gray-400 mr-2" />
            <input type="text" placeholder="Search Bookings..." className="flex-1 outline-none" />
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="p-3 border rounded-xl shadow-sm hover:shadow-md transition bg-white cursor-pointer"
              onClick={() => onOpenChat(chat)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${chat.avatarColor}`}
                  >
                    {chat.name[0]}
                  </div>
                  <span className="text-gray-800 ml-2 flex items-center">
                    {chat.name}
                    {chat.verified && <span className="ml-1 text-xs text-xl">💎</span>}
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    chat.booking?.status === 'Confirmed'
                      ? 'bg-green-100 text-green-700'
                      : chat.booking?.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {chat.booking?.status || 'No Booking'}
                </span>
              </div>
              {chat.booking && (
                <div className="text-xs text-gray-600 space-y-1 mt-2 border-t pt-2">
                  <p>📅 Date: {chat.booking.date} at {chat.booking.time}</p>
                  <p>
                    💰 Price: ₹{chat.booking.price.toLocaleString()}{' '}
                    {chat.booking.paidAdvance ? '(Advance Paid)' : ''}
                  </p>
                  <p>📍 Location: {chat.booking.location}</p>
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 truncate">Last Chat: {chat.lastMessage}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
