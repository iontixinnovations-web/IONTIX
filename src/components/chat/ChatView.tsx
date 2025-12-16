import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Timer,
  Video,
  Phone,
  Lock,
  MessageSquare,
  Smile,
  Camera,
  DollarSign,
  Send,
  Mic,
  Gift,
  Zap,
  Monitor,
  Repeat,
  MessageSquareMore,
  AlertTriangle,
  Calendar,
  BookOpen,
  Share2,
  Star,
  X,
  CheckCircle,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ChatUser, ChatTab, Message } from './data';
import { GLOW_GRADIENT_HEADER, SMART_REPLIES, generateSampleMessages } from './data';
import { MessageBubble } from './MessageBubble';
import { EmojiPopup, ReactionAnimation } from './shared';

interface ChatViewProps {
  user: ChatUser;
  theme: any;
  onBack: () => void;
  bubbleStyle: 'soft' | 'minimal' | 'bold';
  chatBackground: string;
  readReceiptsDisabled: boolean;
  onlineStatusHidden: boolean;
  profilePhotoHidden: boolean;
  hapticFeedbackStrength: string;
  animationToggle: boolean;
}

export function ChatView({
  user,
  theme,
  onBack,
  bubbleStyle,
  chatBackground,
  readReceiptsDisabled,
  onlineStatusHidden,
  profilePhotoHidden,
  hapticFeedbackStrength,
  animationToggle,
}: ChatViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [showEmojiPopup, setShowEmojiPopup] = useState(false);
  const [lastReaction, setLastReaction] = useState<string | null>(null);
  const [isRemoteTyping, setIsRemoteTyping] = useState(false);
  const [showProfilePopover, setShowProfilePopover] = useState(false);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [autoDeleteDuration, setAutoDeleteDuration] = useState('24 hours');
  const [showScreenshotToast, setShowScreenshotToast] = useState(false);
  const [isAILookPending, setIsAILookPending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load sample messages
    setMessages(generateSampleMessages(user.id));

    // Simulate typing indicator
    setIsRemoteTyping(true);
    const timer = setTimeout(() => setIsRemoteTyping(false), 3000);

    return () => clearTimeout(timer);
  }, [user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Screenshot alert simulation for contacts
  useEffect(() => {
    if (user.tab === 'contacts') {
      const timer = setTimeout(() => setShowScreenshotToast(true), 1500);
      const hideTimer = setTimeout(() => setShowScreenshotToast(false), 5500);
      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, [user.tab]);

  const sendMessage = (text?: string, action?: string) => {
    // Haptic feedback
    if (navigator.vibrate && hapticFeedbackStrength !== 'off') {
      navigator.vibrate(hapticFeedbackStrength === 'high' ? 50 : 10);
    }

    const messageText = text || inputMessage.trim();
    if (!messageText && !action) return;

    const newMessage: Message = {
      id: Math.random().toString(36),
      text: messageText,
      action: action as any,
      senderId: 'me',
      timestamp: Date.now(),
      isMine: true,
      status: 'sent',
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');
    setShowEmojiPopup(false);
  };

  const sendReaction = (emoji: string) => {
    setLastReaction(emoji);
    sendMessage(emoji, 'reaction');
    setTimeout(() => setLastReaction(null), 1500);
  };

  const triggerAILookFlow = () => {
    setIsAILookPending(true);
    setTimeout(() => {
      setIsAILookPending(false);
      sendMessage(
        "AI Look Recommendation: Based on your input, here is a suggested 'Sunset Glow' look with a product link: https://glow.app/ar/look42 (Mock)",
        'ai_look'
      );
    }, 3000);
  };

  const triggerVoiceCommand = () => {
    toast.info('Voice Command AI: Listening...');
    setTimeout(() => {
      setInputMessage("What's the price for a full bridal makeup package?");
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col relative">
      {/* Header */}
      <header className={`flex items-center justify-between p-4 ${GLOW_GRADIENT_HEADER} text-white shadow-xl`}>
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-white hover:bg-white/20 mr-2 transition"
            title="Back to Chat List"
          >
            <ArrowLeft size={24} />
          </button>

          <button
            onClick={() => (user.tab === 'artist' || user.tab === 'messenger') && setShowProfilePopover(true)}
            className="flex items-center hover:bg-white/10 p-1 rounded-full transition"
          >
            <div className="relative">
              <div
                className={`w-10 h-10 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-lg shadow-md ring-2 ring-white/50`}
              >
                {profilePhotoHidden && user.tab !== 'messenger' ? '👤' : user.name[0]}
              </div>
              {!onlineStatusHidden && (
                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    user.status.includes('Active') || user.status === 'Online' ? 'bg-green-400' : 'bg-gray-400'
                  }`}
                ></span>
              )}
            </div>
            <div className="ml-3 text-left">
              <div className="text-white flex items-center">
                <span className={user.tab === 'contacts' ? 'blur-[1px] hover:blur-none transition-all duration-300' : ''}>
                  {user.name}
                </span>
                {user.verified && <span className="ml-1 text-xs text-amber-300 text-xl">💎</span>}
              </div>
              <p
                className={`text-xs ${
                  isRemoteTyping && !onlineStatusHidden
                    ? 'text-yellow-300 animate-pulse'
                    : user.status.includes('Online')
                    ? 'text-green-300'
                    : 'text-white/80'
                }`}
              >
                {isRemoteTyping && !onlineStatusHidden ? 'Typing...' : user.status}
              </p>
            </div>
          </button>
        </div>

        <div className="flex space-x-2 sm:space-x-3">
          {user.tab === 'contacts' && (
            <button
              onClick={() => setShowTimerModal(true)}
              className="p-2 rounded-full text-white bg-white/20 shadow-md hover:bg-white/30 transition shadow-inner"
              title={`Auto-Delete: ${autoDeleteDuration}`}
            >
              <Timer size={20} />
            </button>
          )}
          <button className="p-2 rounded-full text-white bg-white/20 shadow-md hover:bg-white/30 transition shadow-inner" title="HD Video Call">
            <Video size={20} />
          </button>
          <button className="p-2 rounded-full text-white bg-white/20 shadow-md hover:bg-white/30 transition shadow-inner" title="HD Voice Call">
            <Phone size={20} />
          </button>
        </div>
      </header>

      {/* Pinned Booking Card */}
      {user.tab === 'artist' && user.booking && (
        <div className="p-3 bg-white border-b border-gray-100 shadow-md flex items-center justify-between">
          <div className="flex items-center">
            <Calendar size={24} className={`mr-3 ${theme.secondary}`} />
            <div>
              <p className="text-xs text-gray-800 flex items-center">
                Booking Status:
                <span
                  className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                    user.booking.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {user.booking.status}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                {user.booking.service} on {user.booking.date}
              </p>
            </div>
          </div>
          <button className={`text-xs px-3 py-1 rounded-full text-white ${theme.primary} hover:opacity-90 transition`}>
            Manage
          </button>
        </div>
      )}

      {/* Messages Area */}
      <div className={`flex-1 overflow-y-auto p-4 flex flex-col space-y-2 ${chatBackground}`} style={{ minHeight: '40vh' }}>
        <div className="text-center text-xs text-green-600 bg-green-50 p-2 rounded-lg shadow-inner mb-2 border border-green-200">
          <Lock size={12} className="inline mr-1" /> End-to-End Encryption (AES-256) by default.
        </div>

        {messages.length === 0 && (
          <div className="text-center p-6 text-gray-400 mt-10">
            <MessageSquare size={36} className="mx-auto mb-2" />
            <p className="text-sm">Start a conversation! 💖</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            theme={theme}
            onReaction={sendReaction}
            bubbleStyle={bubbleStyle}
            readReceiptsDisabled={readReceiptsDisabled}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {lastReaction && animationToggle && (
        <ReactionAnimation emoji={lastReaction} onAnimationEnd={() => setLastReaction(null)} />
      )}

      {/* Thread Features */}
      {(user.tab === 'messenger' || user.tab === 'artist') && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-xs text-gray-600 flex items-center">
              <MessageSquareMore size={16} className="mr-1" /> Thread Tools
            </h4>
            <button className="text-xs text-gray-500 hover:text-gray-700 transition">View All</button>
          </div>
          <div className="flex space-x-3 mt-2 overflow-x-auto pb-1 hide-scrollbar">
            <button
              onClick={triggerAILookFlow}
              disabled={isAILookPending}
              className={`flex-shrink-0 w-32 h-14 rounded-xl text-sm text-white transition shadow-lg ${theme.primary} hover:opacity-90 flex flex-col items-center justify-center`}
            >
              <Zap size={16} className={`mb-0.5 ${isAILookPending ? 'animate-spin' : ''}`} />
              {isAILookPending ? 'Analyzing...' : 'AI Look Suggestion'}
            </button>
            <button className="flex-shrink-0 w-32 h-14 rounded-xl text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm flex flex-col items-center justify-center">
              <Monitor size={16} className="mb-0.5" /> Start Collab Stream
            </button>
            <button className="flex-shrink-0 w-32 h-14 rounded-xl text-sm text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 transition shadow-sm flex flex-col items-center justify-center">
              <Repeat size={16} className="mb-0.5" /> Request Revision
            </button>
          </div>
        </div>
      )}

      {/* Smart Replies for Contacts */}
      {user.tab === 'contacts' && (
        <div className="p-3 bg-gray-50 border-t border-gray-200">
          <div className="flex space-x-2 overflow-x-auto pb-1 hide-scrollbar">
            {SMART_REPLIES.map((reply, index) => (
              <button
                key={index}
                onClick={() => sendMessage(reply)}
                className="flex-shrink-0 px-4 py-2 text-sm bg-white border border-gray-300 rounded-full text-gray-700 hover:bg-purple-50 hover:border-purple-500 transition shadow-sm"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Emoji Popup */}
      {showEmojiPopup && <EmojiPopup onSelect={sendReaction} positionRef={inputBarRef} />}

      {/* Input Area */}
      <div ref={inputBarRef} className="p-3 bg-white border-t border-gray-200 shadow-inner">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEmojiPopup(!showEmojiPopup)}
            className={`p-2 text-gray-500 rounded-full transition shadow-md bg-gray-50 hover:shadow-lg ${
              showEmojiPopup ? 'text-purple-500' : 'hover:text-pink-500'
            }`}
            title="Emoji/Quick Stickers"
          >
            <Smile size={24} />
          </button>

          <button
            className="p-2 text-gray-500 hover:text-pink-500 rounded-full transition shadow-md bg-gray-50 hover:shadow-lg"
            title="Attach Media/Look/AR Preview"
          >
            {user.tab === 'messenger' ? <Gift size={24} /> : <Camera size={24} />}
          </button>

          {(user.tab === 'artist' || user.tab === 'contacts') && (
            <button
              className="p-2 text-green-500 hover:text-green-600 rounded-full transition shadow-md bg-gray-50 hover:shadow-lg"
              title="Send Glow Coins / Pay Advance"
            >
              <DollarSign size={24} />
            </button>
          )}

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder={user.tab === 'artist' ? 'Discuss looks or send payment...' : 'Type a Glow Reply...'}
            className="flex-1 p-3 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-300 text-gray-800 placeholder-gray-400"
          />

          {!inputMessage.trim() ? (
            <button
              onClick={triggerVoiceCommand}
              className={`p-3 rounded-full transition duration-300 ${theme.primary} text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95`}
              title="Voice Note/Voice Command AI"
            >
              <Mic size={24} />
            </button>
          ) : (
            <button
              onClick={() => sendMessage()}
              className={`p-3 rounded-full transition duration-300 ${theme.primary} text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95`}
            >
              <Send size={24} />
            </button>
          )}
        </div>
      </div>

      {/* Screenshot Alert Toast */}
      <div
        className={`fixed bottom-24 left-1/2 -translate-x-1/2 p-3 bg-red-600 text-white rounded-xl shadow-2xl transition-opacity duration-300 transform ${
          showScreenshotToast ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        <div className="flex items-center">
          <AlertTriangle size={20} className="mr-2" /> SCREENSHOT ALERT: This chat is protected!
        </div>
      </div>

      {/* Timer Modal */}
      {showTimerModal && (
        <TimerModal
          onClose={() => setShowTimerModal(false)}
          currentDuration={autoDeleteDuration}
          setDuration={setAutoDeleteDuration}
          theme={theme}
        />
      )}

      {/* Profile Popover */}
      {showProfilePopover && (user.tab === 'artist' || user.tab === 'messenger') && (
        <ProfilePopover user={user} onClose={() => setShowProfilePopover(false)} theme={theme} />
      )}
    </div>
  );
}

// Timer Modal Component
function TimerModal({ onClose, currentDuration, setDuration, theme }: any) {
  const durations = ['Off', '24 hours', '7 days', '90 days'];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all">
        <h2 className="text-2xl text-gray-800 flex items-center">
          <Timer className="mr-2 text-purple-500" /> Auto-Delete Messages
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Set a time after which messages will automatically disappear for both you and your contact.
        </p>

        <div className="space-y-3">
          {durations.map((duration) => (
            <button
              key={duration}
              onClick={() => setDuration(duration)}
              className={`w-full p-3 rounded-xl text-left transition flex justify-between items-center ${
                currentDuration === duration
                  ? `${theme.primary} text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {duration}
              {currentDuration === duration && <CheckCircle size={20} />}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-800 transition shadow-lg"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Profile Popover Component
function ProfilePopover({ user, onClose, theme }: any) {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-4 pt-16">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div
                className={`w-16 h-16 rounded-full ${user.avatarColor} flex items-center justify-center text-white text-3xl shadow-md ring-4 ring-white`}
              >
                {user.name[0]}
              </div>
              <div className="ml-4">
                <h3 className="text-xl text-gray-800 flex items-center">
                  {user.name}
                  <span className="ml-1 text-xs text-amber-500 text-xl">💎</span>
                </h3>
                <p className="text-sm text-gray-500">{user.bio || 'Influencer'}</p>
                <div className="flex items-center text-sm mt-1 text-yellow-500">
                  <Star size={14} className="fill-current mr-1" />
                  <span>{user.booking?.rating || '4.9'} Rating</span>
                </div>
              </div>
            </div>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          <div className="mt-6 border-t pt-4 space-y-3">
            <button className={`w-full p-3 rounded-xl text-white ${theme.primary} transition hover:shadow-lg flex items-center justify-center`}>
              <BookOpen size={20} className="mr-2" /> Book Now
            </button>
            <button className="w-full p-3 rounded-xl border border-gray-300 text-gray-700 transition hover:bg-gray-100 flex items-center justify-center">
              <Share2 size={20} className="mr-2" /> Share Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
