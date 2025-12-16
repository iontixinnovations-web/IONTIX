import { useState } from 'react';
import { Users, TrendingUp, Palette, Zap, ArrowLeft } from 'lucide-react';
import type { ChatTab, ChatUser } from './chat/data';
import { THEMES, GLOW_GRADIENT_HEADER, MOCK_DATA, FONT_CLASSES } from './chat/data';
import { ChatList } from './chat/ChatList';
import { ChatView } from './chat/ChatView';
import { SettingsModal } from './chat/SettingsModal';

interface ChatScreenProps {
  onNavigateHome?: () => void;
  initialTab?: ChatTab;
}

export function ChatScreen({ onNavigateHome, initialTab = 'contacts' }: ChatScreenProps) {
  const [currentTab, setCurrentTab] = useState<ChatTab>(initialTab);
  const [currentView, setCurrentView] = useState<'list' | 'chat'>('list');
  const [currentChatUser, setCurrentChatUser] = useState<ChatUser | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Settings State
  const [bubbleStyle, setBubbleStyle] = useState<'soft' | 'minimal' | 'bold'>('soft');
  const [fontStyle, setFontStyle] = useState('Glow Sans');
  const [chatBackground, setChatBackground] = useState('bg-gradient-to-b from-gray-50 to-white');
  const [appTheme, setAppTheme] = useState('light');
  const [language, setLanguage] = useState('english');
  const [smartAlertsEnabled, setSmartAlertsEnabled] = useState(true);
  const [onlineStatusHidden, setOnlineStatusHidden] = useState(false);
  const [readReceiptsDisabled, setReadReceiptsDisabled] = useState(false);
  const [profilePhotoHidden, setProfilePhotoHidden] = useState(false);
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [animationToggle, setAnimationToggle] = useState(true);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  const [motionIntensity, setMotionIntensity] = useState('medium');
  const [autoCleanCache, setAutoCleanCache] = useState(false);
  const [hapticFeedbackStrength, setHapticFeedbackStrength] = useState('low');

  const currentTheme = THEMES[currentTab];
  const mainAppClass = appTheme === 'light'
    ? 'bg-white text-gray-800'
    : appTheme === 'dark'
    ? 'bg-gray-900 text-white'
    : 'bg-gradient-to-br from-pink-900 to-purple-900 text-white';

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small':
        return 'text-sm';
      case 'large':
        return 'text-lg';
      default:
        return 'text-base';
    }
  };

  const handleTabSwitch = (id: ChatTab) => {
    setCurrentTab(id);
    setCurrentView('list');
  };

  const handleOpenChat = (user: ChatUser) => {
    setCurrentChatUser(user);
    setCurrentView('chat');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setCurrentChatUser(null);
  };

  const channels = [
    { id: 'contacts' as ChatTab, name: 'Glow Contact', icon: Users },
    { id: 'messenger' as ChatTab, name: 'Glow Messenger', icon: TrendingUp },
    { id: 'artist' as ChatTab, name: 'Glow Artist', icon: Palette },
  ];

  return (
    <div
      className={`chat-screen-container max-w-lg mx-auto h-screen flex flex-col rounded-lg shadow-2xl overflow-hidden relative ${FONT_CLASSES[fontStyle as keyof typeof FONT_CLASSES]} ${mainAppClass} ${getFontSizeClass()}`}
      style={{ fontFamily: fontStyle === 'Cute Script' ? "'Caveat', cursive" : undefined }}
    >
      {/* Top Channel Navigation */}
      <div className={`p-2 pt-4 border-b-2 border-gray-100 flex items-center shadow-lg ${GLOW_GRADIENT_HEADER}`}>
        {/* Back Button */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="flex-shrink-0 ml-2 p-2 rounded-full hover:bg-white/20 transition duration-300"
            title="Back to Home"
          >
            <ArrowLeft size={24} className="text-white" />
          </button>
        )}
        
        {/* Channel Tabs */}
        <div className="flex-1 flex justify-around">
          {channels.map((channel) => {
            const isActive = channel.id === currentTab;
            const IconComponent = channel.icon;
            return (
              <button
                key={channel.id}
                onClick={() => handleTabSwitch(channel.id)}
                className={`flex flex-col items-center p-2 rounded-xl transition duration-300 ${
                  isActive ? 'bg-white/30 shadow-inner' : 'hover:bg-white/10'
                }`}
              >
                <IconComponent
                  size={28}
                  className={`text-white transition duration-300 ${isActive ? 'scale-110 drop-shadow-md' : 'opacity-80'}`}
                />
                <span className={`mt-1 text-xs text-white ${isActive ? 'underline' : 'opacity-80'}`}>
                  {channel.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col relative overflow-hidden ${mainAppClass.split(' ').filter((c) => c.startsWith('bg-')).join(' ')}`}>
        {currentView === 'list' ? (
          <>
            <ChatList currentTab={currentTab} onOpenChat={handleOpenChat} onOpenSettings={() => setShowSettingsModal(true)} />
            
            {/* Floating AI Orb */}
            {animationToggle && (
              <button
                className={`fixed bottom-20 right-4 w-14 h-14 rounded-full ${currentTheme.primary} text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center justify-center z-30`}
                title="AI Assistant: Quick Suggestions"
                onClick={() => {
                  const firstUser = currentTab === 'messenger'
                    ? MOCK_DATA.messenger.primary[0]
                    : currentTab === 'artist'
                    ? MOCK_DATA.artist[0]
                    : MOCK_DATA.contacts[0];
                  handleOpenChat(firstUser);
                }}
              >
                <Zap size={24} className="animate-pulse mr-1" />
              </button>
            )}
          </>
        ) : (
          currentChatUser && (
            <ChatView
              user={currentChatUser}
              theme={currentTheme}
              onBack={handleBackToList}
              bubbleStyle={bubbleStyle}
              chatBackground={chatBackground}
              readReceiptsDisabled={readReceiptsDisabled}
              onlineStatusHidden={onlineStatusHidden}
              profilePhotoHidden={profilePhotoHidden}
              hapticFeedbackStrength={hapticFeedbackStrength}
              animationToggle={animationToggle}
            />
          )
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          theme={currentTheme}
          bubbleStyle={bubbleStyle}
          setBubbleStyle={setBubbleStyle}
          fontStyle={fontStyle}
          setFontStyle={setFontStyle}
          chatBackground={chatBackground}
          setChatBackground={setChatBackground}
          appTheme={appTheme}
          setAppTheme={setAppTheme}
          language={language}
          setLanguage={setLanguage}
          smartAlertsEnabled={smartAlertsEnabled}
          setSmartAlertsEnabled={setSmartAlertsEnabled}
          onlineStatusHidden={onlineStatusHidden}
          setOnlineStatusHidden={setOnlineStatusHidden}
          readReceiptsDisabled={readReceiptsDisabled}
          setReadReceiptsDisabled={setReadReceiptsDisabled}
          profilePhotoHidden={profilePhotoHidden}
          setProfilePhotoHidden={setProfilePhotoHidden}
          cloudSyncEnabled={cloudSyncEnabled}
          setCloudSyncEnabled={setCloudSyncEnabled}
          fontSize={fontSize}
          setFontSize={setFontSize}
          animationToggle={animationToggle}
          setAnimationToggle={setAnimationToggle}
          aiPersonality={aiPersonality}
          setAiPersonality={setAiPersonality}
          motionIntensity={motionIntensity}
          setMotionIntensity={setMotionIntensity}
          autoCleanCache={autoCleanCache}
          setAutoCleanCache={setAutoCleanCache}
          hapticFeedbackStrength={hapticFeedbackStrength}
          setHapticFeedbackStrength={setHapticFeedbackStrength}
        />
      )}
    </div>
  );
}
