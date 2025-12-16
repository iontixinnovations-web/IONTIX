import { X, Settings, Brush, Lock, Zap, DollarSign, Cloud, Globe, HardDrive, MessageSquareDiff, BarChart } from 'lucide-react';
import { Accordion, ToggleSwitch } from './shared';
import {
  BUBBLE_STYLES,
  WALLPAPER_OPTIONS,
  APP_THEMES,
  LANGUAGES,
  FONT_SIZES,
  AI_MODES,
  HAPTIC_STRENGTHS,
  MOTION_INTENSITIES,
} from './data';

interface SettingsModalProps {
  onClose: () => void;
  theme: any;
  bubbleStyle: keyof typeof BUBBLE_STYLES;
  setBubbleStyle: (style: keyof typeof BUBBLE_STYLES) => void;
  fontStyle: string;
  setFontStyle: (font: string) => void;
  chatBackground: string;
  setChatBackground: (bg: string) => void;
  appTheme: string;
  setAppTheme: (theme: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  smartAlertsEnabled: boolean;
  setSmartAlertsEnabled: (enabled: boolean) => void;
  onlineStatusHidden: boolean;
  setOnlineStatusHidden: (hidden: boolean) => void;
  readReceiptsDisabled: boolean;
  setReadReceiptsDisabled: (disabled: boolean) => void;
  profilePhotoHidden: boolean;
  setProfilePhotoHidden: (hidden: boolean) => void;
  cloudSyncEnabled: boolean;
  setCloudSyncEnabled: (enabled: boolean) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  animationToggle: boolean;
  setAnimationToggle: (enabled: boolean) => void;
  aiPersonality: string;
  setAiPersonality: (mode: string) => void;
  motionIntensity: string;
  setMotionIntensity: (intensity: string) => void;
  autoCleanCache: boolean;
  setAutoCleanCache: (enabled: boolean) => void;
  hapticFeedbackStrength: string;
  setHapticFeedbackStrength: (strength: string) => void;
}

export function SettingsModal(props: SettingsModalProps) {
  const {
    onClose,
    bubbleStyle,
    setBubbleStyle,
    chatBackground,
    setChatBackground,
    appTheme,
    setAppTheme,
    language,
    setLanguage,
    smartAlertsEnabled,
    setSmartAlertsEnabled,
    onlineStatusHidden,
    setOnlineStatusHidden,
    readReceiptsDisabled,
    setReadReceiptsDisabled,
    profilePhotoHidden,
    setProfilePhotoHidden,
    cloudSyncEnabled,
    setCloudSyncEnabled,
    fontSize,
    setFontSize,
    animationToggle,
    setAnimationToggle,
    aiPersonality,
    setAiPersonality,
    motionIntensity,
    setMotionIntensity,
    autoCleanCache,
    setAutoCleanCache,
    hapticFeedbackStrength,
    setHapticFeedbackStrength,
  } = props;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl p-6 transform transition-all overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={24} />
        </button>

        <h2 className="text-3xl mb-6 text-gray-800 flex items-center">
          <Settings className="mr-2 text-pink-500" /> Glow Settings
        </h2>

        {/* Accordion 1: Appearance & Customization */}
        <Accordion title="Appearance & Customization" icon={Brush} defaultOpen={true}>
          <div>
            <label className="block text-sm text-gray-700 mb-2">App Theme (Global)</label>
            <div className="grid grid-cols-3 gap-3">
              {APP_THEMES.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setAppTheme(t.id)}
                    className={`p-3 rounded-xl border-2 text-xs h-16 transition flex flex-col items-center justify-center ${
                      t.class
                    } ${
                      appTheme === t.id
                        ? 'border-pink-500 ring-2 ring-pink-300 shadow-lg'
                        : 'border-gray-300 hover:border-pink-300'
                    }`}
                  >
                    <Icon
                      size={16}
                      className={`mb-1 ${t.id === 'light' ? 'text-yellow-500' : 'text-white'}`}
                    />
                    {t.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2 flex items-center">
              <Globe size={16} className="mr-1 text-blue-500" /> Language Settings
            </label>
            <div className="flex space-x-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-sm capitalize rounded-full transition ${
                    language === lang
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Chat Bubble Style</label>
            <div className="flex space-x-3">
              {(Object.keys(BUBBLE_STYLES) as Array<keyof typeof BUBBLE_STYLES>).map((style) => (
                <button
                  key={style}
                  onClick={() => setBubbleStyle(style)}
                  className={`px-4 py-2 text-sm capitalize rounded-full transition ${
                    bubbleStyle === style
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Font Size (Accessibility)</label>
            <div className="flex space-x-3">
              {FONT_SIZES.map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-4 py-2 text-sm capitalize rounded-full transition ${
                    fontSize === size
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <ToggleSwitch
            label="Reduce System Animations (Accessibility)"
            enabled={!animationToggle}
            setEnabled={(val) => setAnimationToggle(!val)}
          />

          <div>
            <label className="block text-sm text-gray-700 mb-2">Chat Wallpaper</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(WALLPAPER_OPTIONS).map(([name, className]) => (
                <button
                  key={name}
                  onClick={() => setChatBackground(className)}
                  className={`p-3 rounded-lg border-2 text-xs h-16 transition ${className} ${
                    chatBackground === className
                      ? 'border-4 border-pink-500 ring-2 ring-pink-300 shadow-lg'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  <span
                    className={`block ${className.includes('Dark') || className.includes('purple') ? 'text-white' : 'text-gray-800'}`}
                  >
                    {name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Accordion>

        {/* Accordion 2: Privacy & Security */}
        <Accordion title="Privacy & Security" icon={Lock}>
          <h4 className="text-gray-800 pt-1">Privacy Controls</h4>
          <ToggleSwitch
            label="Hide 'Active Now' (Online Status Toggle)"
            enabled={onlineStatusHidden}
            setEnabled={setOnlineStatusHidden}
          />
          <ToggleSwitch
            label="Disable Read Receipts (Blue Ticks)"
            enabled={readReceiptsDisabled}
            setEnabled={setReadReceiptsDisabled}
          />
          <ToggleSwitch
            label="Hide Profile Photo from Public"
            enabled={profilePhotoHidden}
            setEnabled={setProfilePhotoHidden}
          />

          <h4 className="text-gray-800 pt-3 flex items-center">
            <Cloud size={16} className="mr-2 text-blue-500" /> Data Management
          </h4>
          <ToggleSwitch
            label="Cloud Sync (Glow Cloud Backup)"
            enabled={cloudSyncEnabled}
            setEnabled={setCloudSyncEnabled}
          />
          <ToggleSwitch
            label="Auto Clean Cache (Every 30 Days)"
            enabled={autoCleanCache}
            setEnabled={setAutoCleanCache}
          />
          <div className="text-xs text-gray-500 pt-1">
            Current Cache Size: 48MB. Last Clean: 3 days ago.
          </div>
        </Accordion>

        {/* Accordion 3: Advanced AI & Premium */}
        <Accordion title="Advanced AI & Premium" icon={Zap}>
          <h4 className="text-gray-800 pt-1">AI Personalization</h4>
          <div>
            <label className="block text-sm text-gray-700 mb-2">AI Personality Mode</label>
            <div className="flex space-x-2">
              {AI_MODES.map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAiPersonality(mode)}
                  className={`px-3 py-1 text-sm capitalize rounded-full transition ${
                    aiPersonality === mode
                      ? 'bg-red-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <h4 className="text-gray-800 pt-3">Motion & Notifications</h4>
          <ToggleSwitch
            label="Smart Alerts (AI Suggestions & Promos)"
            enabled={smartAlertsEnabled}
            setEnabled={setSmartAlertsEnabled}
          />

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Motion Intensity Control (Premium)
            </label>
            <div className="flex space-x-2">
              {MOTION_INTENSITIES.map((intensity) => (
                <button
                  key={intensity}
                  onClick={() => setMotionIntensity(intensity)}
                  className={`px-3 py-1 text-sm capitalize rounded-full transition ${
                    motionIntensity === intensity
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Vibration & Haptic Feedback Strength
            </label>
            <div className="flex space-x-2">
              {HAPTIC_STRENGTHS.map((strength) => (
                <button
                  key={strength}
                  onClick={() => setHapticFeedbackStrength(strength)}
                  className={`px-3 py-1 text-sm capitalize rounded-full transition ${
                    hapticFeedbackStrength === strength
                      ? 'bg-teal-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {strength}
                </button>
              ))}
            </div>
          </div>
        </Accordion>

        {/* Accordion 4: Wallet & Support */}
        <Accordion title="Wallet & Support" icon={DollarSign}>
          <button className="w-full p-3 rounded-xl bg-green-100 text-green-700 transition hover:bg-green-200 flex items-center justify-between">
            <span className="flex items-center">
              <HardDrive size={20} className="mr-2" /> Glow Wallet Management
            </span>
            <span>₹ 4,500.00</span>
          </button>
          <div className="text-xs text-gray-500 pt-1">
            Add balance, view transaction history, or redeem codes.
          </div>

          <div className="flex justify-between space-x-3 pt-3">
            <button className="flex-1 p-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center">
              <MessageSquareDiff size={16} className="mr-2" /> Report Issue
            </button>
            <button className="flex-1 p-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 flex items-center justify-center">
              <BarChart size={16} className="mr-2" /> About
            </button>
          </div>
        </Accordion>

        <button
          onClick={onClose}
          className="mt-8 w-full bg-gray-700 text-white p-3 rounded-xl hover:bg-gray-800 transition shadow-lg"
        >
          Close Settings
        </button>
      </div>
    </div>
  );
}
