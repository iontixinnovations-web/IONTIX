import { useState, useRef, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import type { Customizations, ShopCategory } from '../MirrorScreen';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomization: (type: keyof Customizations, value: string) => void;
  onNavigateToShop: (category: ShopCategory) => void;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export function ChatModal({ isOpen, onClose, onCustomization, onNavigateToShop }: ChatModalProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: 'Hello! 👋 Type or give a voice command to change your look.\n\nExample: "Change lipstick to **Matte Red**"'
    }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const processChatCommand = () => {
    const command = input.trim();
    if (!command) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: command }]);
    setInput('');

    // Process command
    setTimeout(() => {
      const lowerCommand = command.toLowerCase();
      let aiResponse = '';
      let actionTaken = false;

      if (lowerCommand.includes('lipstick') || lowerCommand.includes('lip color') || lowerCommand.includes('lip')) {
        let color = 'Matte Red';
        if (lowerCommand.includes('pink')) color = 'Glossy Pink';
        if (lowerCommand.includes('nude')) color = 'Velvet Nude';
        if (lowerCommand.includes('coral')) color = 'Shiny Coral';

        onCustomization('lipstick', color);
        aiResponse = `Your **Lipstick** has been updated to **${color}**. How does that look in the mirror?`;
        actionTaken = true;

      } else if (lowerCommand.includes('eyeliner') || lowerCommand.includes('wing') || lowerCommand.includes('liner')) {
        let style = 'Thin Wing';
        if (lowerCommand.includes('smoky')) style = 'Smoky Edge';
        if (lowerCommand.includes('blue')) style = 'Electric Blue';
        if (lowerCommand.includes('cateye')) style = 'Classic Cateye';

        onCustomization('eyeliner', style);
        aiResponse = `The **Eyeliner** has been changed to **${style}** style. Check the live mirror!`;
        actionTaken = true;

      } else if (lowerCommand.includes('blush') || lowerCommand.includes('cheek')) {
        let blush = 'Soft Peach';
        if (lowerCommand.includes('pink')) blush = 'Rose Pink';

        onCustomization('blush', blush);
        aiResponse = `Applying **${blush}** blush to your cheekbones. Done!`;
        actionTaken = true;

      } else if (lowerCommand.includes('skincare') || lowerCommand.includes('serum')) {
        aiResponse = 'Need skincare? Showing you the recommended **Hydra-Boost Serum** in the shop section.';
        onNavigateToShop('Skincare');
        actionTaken = true;
      } else {
        aiResponse = `I understood the command "${command.substring(0, 20)}...", but unfortunately, I cannot fully execute it in this demo. Please try modifying an eyeliner, lipstick, or blush color.`;
      }

      setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    }, 1200);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      processChatCommand();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="w-full max-w-md bg-white h-screen flex flex-col">
        <div className="p-4 w-full flex justify-between items-center bg-purple-600 sticky top-0">
          <h3 className="text-lg text-white text-center">AI Voice Assistant</h3>
          <button onClick={onClose} className="text-white p-2 rounded-full hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex-grow w-full overflow-y-auto space-y-4 bg-pink-50">
          {messages.map((message, index) => (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3 rounded-xl max-w-[80%] shadow-md ${
                  message.role === 'user'
                    ? 'bg-pink-500 text-white rounded-tr-none'
                    : 'bg-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-line">{message.content}</p>
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <div className="p-3 w-full flex bg-white border-t border-gray-200 sticky bottom-0">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your command..."
            className="flex-grow p-3 border border-gray-300 rounded-l-xl text-gray-800 focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={processChatCommand}
            className="bg-pink-500 text-white p-3 rounded-r-xl hover:bg-pink-600 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
