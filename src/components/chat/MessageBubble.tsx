import { Clock, CheckCircle, EyeOff } from 'lucide-react';
import type { Message } from './data';
import { BUBBLE_STYLES } from './data';

interface MessageBubbleProps {
  message: Message;
  theme: any;
  onReaction: (emoji: string) => void;
  bubbleStyle: keyof typeof BUBBLE_STYLES;
  readReceiptsDisabled: boolean;
}

export function MessageBubble({
  message,
  theme,
  onReaction,
  bubbleStyle,
  readReceiptsDisabled,
}: MessageBubbleProps) {
  const isMyMessage = message.isMine;

  const moodColor = (text: string) => {
    const length = text?.length || 0;
    if (length > 80) return 'bg-gradient-to-r from-red-500 to-pink-600';
    return `bg-gradient-to-br ${theme.bubble}`;
  };

  let colorClass, positionClass, bubbleShapeClass;

  if (isMyMessage) {
    colorClass = `${moodColor(message.text)} text-white`;
    positionClass = 'self-end';
    bubbleShapeClass = BUBBLE_STYLES[bubbleStyle];
  } else {
    colorClass = 'bg-gray-100 text-gray-800';
    positionClass = 'self-start';
    bubbleShapeClass = BUBBLE_STYLES[bubbleStyle]
      .replace('tl', 'tr')
      .replace('b-xl', 'l-xl');
  }

  if (message.action === 'reaction') {
    return <div className={`my-1 text-4xl p-1 ${positionClass}`}>{message.text}</div>;
  }

  const DeliveryStatus = () => {
    if (readReceiptsDisabled || !isMyMessage || message.status === 'sending') {
      return message.status === 'sending' ? (
        <Clock size={12} className="text-white/70 ml-1" />
      ) : null;
    }

    const isSeen = message.status === 'seen';
    const iconClass = isSeen ? `${theme.statusColor}` : 'text-white/70';

    return (
      <div className="flex items-center justify-end text-[10px] text-white/80 mt-1">
        <span className="mr-1">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })}
        </span>
        <div className={`flex items-center ml-1 ${iconClass}`}>
          <CheckCircle
            size={isSeen ? 10 : 12}
            className={`${isSeen ? 'fill-current text-white' : ''}`}
          />
          {isSeen && <CheckCircle size={10} className="fill-current text-white -ml-1.5" />}
          {!isSeen && <span className="text-xs ml-0.5">✓</span>}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={() => onReaction('❤️')}
        className={`
          ${positionClass} 
          max-w-xs sm:max-w-md my-1 p-3 transition-all duration-300 
          ${colorClass} ${bubbleShapeClass} relative
          ${
            message.vanish
              ? 'opacity-70 blur-[1px] hover:blur-none transition-all duration-500 cursor-pointer'
              : ''
          }
          active:scale-95 transform shadow-lg
        `}
        title="Tap to send a quick reaction"
      >
        <div>{message.text}</div>
        {isMyMessage && <DeliveryStatus />}
      </button>
      {message.vanish && (
        <span
          className={`text-xs text-red-500 ${
            isMyMessage ? 'text-right' : 'text-left'
          } mt-1`}
        >
          <EyeOff size={12} className="inline mr-1" /> Vanish Mode: Read, then Gone.
        </span>
      )}
    </div>
  );
}
