import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { QUICK_EMOJIS } from './data';

interface AccordionProps {
  title: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function Accordion({ title, icon: Icon, children, defaultOpen = false }: AccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left py-2 focus:outline-none"
      >
        <h3 className="text-xl text-gray-800 flex items-center">
          <Icon size={20} className="mr-2 text-pink-500" />
          {title}
        </h3>
        {isOpen ? (
          <ChevronUp size={24} className="text-pink-500" />
        ) : (
          <ChevronDown size={24} className="text-gray-400" />
        )}
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-[1000px] pt-3' : 'max-h-0'
        }`}
      >
        <div className="pb-2 space-y-4">{children}</div>
      </div>
    </div>
  );
}

interface ToggleSwitchProps {
  label: string;
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export function ToggleSwitch({ label, enabled, setEnabled }: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        onClick={() => setEnabled(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          enabled ? 'bg-pink-600 focus:ring-pink-500' : 'bg-gray-200 focus:ring-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

interface EmojiPopupProps {
  onSelect: (emoji: string) => void;
  positionRef: React.RefObject<HTMLDivElement>;
}

export function EmojiPopup({ onSelect, positionRef }: EmojiPopupProps) {
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (positionRef.current) {
      const rect = positionRef.current.getBoundingClientRect();
      setPopupStyle({
        bottom: window.innerHeight - rect.top + 10,
        left: rect.left + rect.width / 2 - 100,
      });
    }
  }, [positionRef]);

  return (
    <div
      className="fixed z-40 bg-white p-3 rounded-2xl shadow-2xl border border-gray-100 flex space-x-2 animate-bounce-in"
      style={popupStyle}
    >
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="text-2xl transition hover:scale-125 active:scale-90"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

interface ReactionAnimationProps {
  emoji: string;
  onAnimationEnd: () => void;
}

export function ReactionAnimation({ emoji, onAnimationEnd }: ReactionAnimationProps) {
  return (
    <div onAnimationEnd={onAnimationEnd} className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-6xl animate-[pop-fade_1s_ease-out_forwards]">{emoji}</div>
    </div>
  );
}
