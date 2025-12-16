import { Calendar, Eye, Heart } from 'lucide-react';
import { useState } from 'react';

interface FeedCardProps {
  title: string;
  description: string;
  imageUrl: string;
  tag: string;
  onAction: (action: string) => void;
}

export function FeedCard({ title, description, imageUrl, tag, onAction }: FeedCardProps) {
  const [liked, setLiked] = useState(false);

  const handleLike = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const card = button.closest('.feed-card');
    if (!card) return;

    setLiked(!liked);

    // Create floating emoji
    const emoji = document.createElement('div');
    emoji.textContent = '💖';
    emoji.className = 'floating-emoji';

    const rect = button.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();

    emoji.style.position = 'absolute';
    emoji.style.left = `${rect.left - cardRect.left + rect.width / 2}px`;
    emoji.style.top = `${rect.top - cardRect.top}px`;

    card.appendChild(emoji);

    setTimeout(() => {
      emoji.remove();
    }, 1000);

    onAction('Like');
  };

  return (
    <div className="feed-card rounded-3xl p-4 shadow-2xl relative">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-auto rounded-2xl mb-4 object-cover border border-pink-200"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/600x400/FFD6E8/1f2937?text=' + encodeURIComponent(title);
        }}
      />

      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl text-gray-900">{title}</h3>
        <span className="px-3 py-1 text-xs rounded-full text-white shadow-lg glow-accent whitespace-nowrap">
          {tag}
        </span>
      </div>

      <p className="text-gray-600 text-sm mb-4">{description}</p>

      <div className="flex space-x-3">
        <button
          onClick={() => onAction('Book Now')}
          className="flex-1 px-4 py-2 text-white rounded-full glow-accent shadow-xl transition-transform active:scale-98"
        >
          <Calendar className="w-4 h-4 inline mr-1" /> Book Now
        </button>
        <button
          onClick={() => onAction('Try-On')}
          className="px-4 py-2 bg-[#C0A0FF] text-white rounded-full shadow-lg hover:bg-purple-500 transition-transform active:scale-98"
        >
          <Eye className="w-4 h-4 inline mr-1" /> Try-On
        </button>
        <button
          onClick={handleLike}
          className={`px-3 py-2 rounded-full shadow-lg transition-transform active:scale-98 ${
            liked ? 'bg-red-500 text-white' : 'bg-red-100 text-red-500 hover:bg-red-200'
          }`}
          aria-label="Like Post"
        >
          <Heart className={`w-4 h-4 inline ${liked ? 'fill-white' : ''}`} />
        </button>
      </div>
    </div>
  );
}
