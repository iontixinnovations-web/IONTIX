import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard, Brain, ScrollText, Users, Trophy, Lock, Zap,
  Briefcase, BookOpen, Diamond, Settings, Menu, Bell, User, Send,
  ChevronRight, Lightbulb, TrendingUp, DollarSign, Target, Check, ThumbsUp, MessageCircle,
  ArrowLeft, Home
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

// --- CONFIGURATION & MOCK DATA ---
const MOCK_IDEAS = [
  { id: 1, title: "AI-Powered Skincare Diagnostic", category: "Beauty / AI", votes: 1245, rank: 1, potential: 'High' },
  { id: 2, title: "Decentralized Energy Grid App", category: "App / Product", votes: 981, rank: 2, potential: 'Medium' },
  { id: 3, title: "AR Historical Tour Guide", category: "AR", votes: 540, rank: 5, potential: 'High' },
  { id: 4, title: "Sustainable Biodegradable Plastic", category: "Product", votes: 1500, rank: 3, potential: 'High' },
];

const NAV_MAP = [
  { name: 'Dashboard', icon: LayoutDashboard, page: 'dashboard', color: 'indigo' },
  { name: 'Submit Idea', icon: Send, page: 'submit', color: 'pink' },
  { name: 'Community Voting', icon: ThumbsUp, page: 'voting', color: 'purple' },
  { name: 'Top Innovators', icon: Trophy, page: 'innovators', color: 'yellow' },
  { name: 'Investor Connect', icon: Briefcase, page: 'investor', color: 'teal' },
  { name: 'NDA Vault', icon: Lock, page: 'vault', color: 'red' },
  { name: 'AI Pitch Deck', icon: ScrollText, page: 'pitchdeck', color: 'blue' },
  { name: 'Mentor Hub', icon: BookOpen, page: 'mentor', color: 'green' },
  { name: 'Rewards & Coins', icon: Diamond, page: 'rewards', color: 'amber' },
  { name: 'Settings', icon: Settings, page: 'settings', color: 'gray' },
];

// --- UTILITY COMPONENTS ---

const BackgroundGlow = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`
    min-h-screen bg-gray-900
    bg-gradient-to-br from-purple-950 via-pink-950 to-amber-950
    text-gray-100 ${className}
  `}>
    {children}
  </div>
);

const GlowingButton = ({ children, onClick, className = '', disabled = false }: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`
      px-6 py-3 font-semibold rounded-xl transition-all duration-300
      bg-gradient-to-r from-pink-600 to-purple-600 text-white
      shadow-xl shadow-pink-500/50 hover:shadow-2xl hover:shadow-pink-400/70
      hover:scale-[1.02] active:scale-[0.98] 
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

const IconButton = ({ icon: Icon, onClick, label, className = '', badge = 0 }: {
  icon: React.ElementType;
  onClick?: () => void;
  label: string;
  className?: string;
  badge?: number;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`p-2 rounded-full relative
      text-purple-200 hover:bg-white/10 hover:text-white transition duration-150 ${className}`}
  >
    <Icon className="w-6 h-6" />
    {badge > 0 && (
      <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const CustomCard = ({ title, children, className = '' }: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`
    bg-gray-800/60 backdrop-blur-md p-6 rounded-2xl border border-purple-700/50
    shadow-lg shadow-black/20 ${className}
  `}>
    {title && <h2 className="text-xl text-purple-300 mb-4 border-b border-purple-700/50 pb-2">{title}</h2>}
    {children}
  </div>
);

// --- SCREEN COMPONENTS ---

const HomeDashboard = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => (
  <div className="space-y-8 p-4 sm:p-8">
    <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-700 shadow-2xl shadow-pink-500/50">
      <h1 className="text-3xl text-white mb-2">Welcome to the Innovators Hub</h1>
      <p className="text-purple-100">Ignite your ideas and connect with the future of R&D.</p>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <CustomCard title="Submit New Idea" className="lg:col-span-1 border-pink-500/50 bg-pink-900/40">
        <p className="mb-6 text-gray-300">Got a revolutionary concept? Submit your idea now and start the analysis process.</p>
        <GlowingButton onClick={() => onNavigate('submit')} className="w-full">
          Submit New Idea →
        </GlowingButton>
      </CustomCard>

      <CustomCard title="Community Voting Highlights" className="lg:col-span-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MOCK_IDEAS.slice(0, 2).map(idea => (
            <div key={idea.id} className="p-4 rounded-xl bg-gray-700/50 flex items-center justify-between hover:ring-2 ring-purple-500 transition">
              <div>
                <p className="text-white">{idea.title}</p>
                <p className="text-sm text-purple-300 flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-1"/> {idea.votes} Votes
                </p>
              </div>
              <GlowingButton onClick={() => onNavigate('voting')} className="py-2 px-3 text-sm">
                Vote Now
              </GlowingButton>
            </div>
          ))}
        </div>
      </CustomCard>
    </div>

    <CustomCard title="Top Innovators (This Month)">
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {Array(5).fill(0).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-48 p-4 bg-gray-700/50 rounded-xl text-center border border-yellow-500/50 shadow-lg shadow-yellow-800/30">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-2 
                ${i === 0 ? 'bg-yellow-500 text-gray-900 ring-4 ring-yellow-300' : 'bg-purple-600 text-white'}`}>
              <User className="w-8 h-8"/>
            </div>
            <p className="text-lg">Innovator #{i + 1}</p>
            <p className={`text-sm ${i === 0 ? 'text-yellow-400' : 'text-purple-300'}`}>
              Rank: {i + 1}
            </p>
            <span className="text-xs text-gray-400">{2000 - i * 300} Votes</span>
          </div>
        ))}
      </div>
    </CustomCard>

    <CustomCard title="AI Tips & Tutorials">
      <p className="text-sm italic text-gray-400 flex items-center">
        <Brain className="w-4 h-4 mr-2 text-purple-400"/>
        "How to pitch your idea better: Focus on problem validation and market size first."
      </p>
    </CustomCard>
  </div>
);

const SubmitIdeaScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Beauty');
  const [isNDASecure, setIsNDASecure] = useState(false);

  const aiSummary = useMemo(() => {
    if (description.length < 50) return 'Keep typing for live AI summary...';
    const words = description.split(' ').slice(0, 15).join(' ');
    return `AI Live Summary: ${words}... (Concept: ${category} idea with ${description.split(' ').length} words)`;
  }, [description, category]);

  const handleSubmit = () => {
    if (title && description) {
      console.log('Idea Submitted for Analysis:', title);
      onNavigate('analyzer', { ideaTitle: title });
    }
  };

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white">Submit New Idea</h1>
      <CustomCard title="Idea Details">
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Idea Title (e.g., Quantum Data Wallet)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-purple-600 focus:ring-2 focus:ring-pink-500 text-white"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-purple-600 focus:ring-2 focus:ring-pink-500 text-white"
          >
            <option>Beauty</option>
            <option>AI</option>
            <option>App</option>
            <option>Product</option>
            <option>AR</option>
            <option>Others</option>
          </select>
          <textarea
            placeholder="Detailed description of your innovative idea..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            className="w-full p-3 rounded-lg bg-gray-700 border border-purple-600 focus:ring-2 focus:ring-pink-500 text-white"
          />
          <p className="text-sm text-purple-300 italic flex items-start">
            <Brain className="w-4 h-4 mt-1 mr-2 flex-shrink-0"/>
            {aiSummary}
          </p>
        </div>
      </CustomCard>

      <CustomCard title="Attachments & Security">
        <div className="flex justify-between items-center mb-4">
          <p className="text-gray-300">Upload supporting images/videos/sketches.</p>
          <button className="py-2 px-4 rounded-full bg-gray-700 text-purple-300 hover:bg-gray-600 transition">
            📎 Upload Files
          </button>
        </div>
        <div className="flex justify-between items-center bg-gray-700/50 p-3 rounded-xl border border-purple-700">
          <label htmlFor="nda-toggle" className="flex items-center space-x-2 cursor-pointer">
            <Lock className="w-5 h-5 text-red-400"/>
            <span className="text-white">Secure with NDA Vault</span>
          </label>
          <div className="relative">
            <input
              type="checkbox"
              id="nda-toggle"
              checked={isNDASecure}
              onChange={(e) => setIsNDASecure(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-pink-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
          </div>
        </div>
        {isNDASecure && (
          <p className="text-xs mt-2 text-red-400 flex items-center">
            <Check className="w-3 h-3 mr-1"/> Auto patent scan in progress. Uniqueness Report will be generated.
          </p>
        )}
      </CustomCard>

      <GlowingButton onClick={handleSubmit} disabled={!title || !description} className="w-full py-4 text-xl">
        🧠 Analyze with AI
      </GlowingButton>
    </div>
  );
};

const AIAnalyzerScreen = ({ routeParams, onNavigate }: { 
  routeParams?: any; 
  onNavigate: (page: string, params?: any) => void 
}) => {
  const [analysisDone, setAnalysisDone] = useState(false);
  const ideaTitle = routeParams?.ideaTitle || "New AI-Powered Concept";

  useEffect(() => {
    const timer = setTimeout(() => setAnalysisDone(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const GaugeBar = ({ label, score, max = 100, colorClass }: {
    label: string;
    score: number;
    max?: number;
    colorClass: string;
  }) => {
    const percentage = (score / max) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm text-gray-300">{label}</span>
          <span className={`${colorClass}`}>{score}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${colorClass}`}
            style={{ width: `${percentage}%`, transition: 'width 1s ease-out' }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white">AI Analysis for: "{ideaTitle}"</h1>

      {!analysisDone ? (
        <CustomCard className="text-center py-12">
          <Zap className="w-12 h-12 mx-auto animate-pulse text-pink-500"/>
          <p className="mt-4 text-xl text-purple-300">Running advanced AI simulations...</p>
          <p className="text-sm text-gray-400">Analyzing Market Fit, Novelty, and Feasibility (MITHAS Protocol)</p>
        </CustomCard>
      ) : (
        <>
          <CustomCard title="Innovation Score & Gauges">
            <div className="flex flex-col items-center justify-center mb-6">
              <p className="text-8xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-500">
                87<span className="text-5xl text-gray-300">/100</span>
              </p>
              <p className="text-lg text-yellow-400 mt-2">Innovation Score</p>
            </div>
            <GaugeBar label="Market Fit" score={92} colorClass="bg-green-500 text-green-400" />
            <GaugeBar label="Novelty" score={85} colorClass="bg-pink-500 text-pink-400" />
            <GaugeBar label="Scalability" score={79} colorClass="bg-purple-500 text-purple-400" />
            <GaugeBar label="Tech Feasibility" score={95} colorClass="bg-yellow-500 text-yellow-400" />
          </CustomCard>

          <CustomCard title="AI Feedback Summary">
            <div className="space-y-3">
              <p className="text-white">Market Potential: <span className="text-yellow-400">⭐⭐⭐⭐☆</span></p>
              <p className="text-white">Tech Feasibility: <span className="text-green-400">✅ Confirmed</span></p>
              <p className="text-white">Revenue Chance: <span className="text-green-400">₹ High</span> (AI predicted ₹1.2Cr/year potential)</p>
              <p className="text-white">Trend Alignment: <span className="text-purple-400">92%</span></p>
            </div>
            <p className="mt-4 p-3 bg-gray-700/50 rounded-lg italic border-l-4 border-pink-500">
              "This concept strongly aligns with 2026 beauty AI and data security trends. High scalability suggests viable growth in Tier 1 and 2 metropolitan markets, but refine the initial target demographic for a stronger launch."
            </p>
          </CustomCard>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <GlowingButton onClick={() => onNavigate('investor')} className="text-sm bg-gradient-to-r from-green-500 to-teal-500 shadow-green-500/50">
              💰 Match with Investors
            </GlowingButton>
            <GlowingButton onClick={() => onNavigate('voting')} className="text-sm">
              🗳️ Submit for Voting
            </GlowingButton>
            <button className="py-3 px-4 bg-gray-700 text-purple-300 rounded-xl hover:bg-gray-600 transition">
              📥 Save Report (PDF)
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const CommunityVotingScreen = ({ onNavigate }: { onNavigate: (page: string, params?: any) => void }) => {
  const [filter, setFilter] = useState('Most Voted');

  const filters = ['Most Voted', 'New Ideas', 'AI Recommended'];

  const IdeaTile = ({ idea }: { idea: typeof MOCK_IDEAS[0] }) => (
    <div className="bg-gray-800/80 p-5 rounded-2xl shadow-xl border border-purple-700/50 hover:border-pink-500/50 transition duration-300">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl text-white flex items-center">
          {idea.rank <= 3 && <Trophy className="w-5 h-5 text-yellow-500 mr-2"/>}
          {idea.title}
        </h3>
        <span className="text-sm text-purple-300 bg-gray-700 px-3 py-1 rounded-full">{idea.category}</span>
      </div>
      <p className="text-sm text-gray-400 mb-4 line-clamp-2">
        A short description placeholder. This innovative solution tackles the issue of data fragmentation in local smart contracts using proprietary Glow Chain technology.
      </p>
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <button className="flex items-center text-pink-400 hover:text-pink-300 transition group">
            <ThumbsUp className="w-5 h-5 mr-1 group-hover:animate-bounce"/> {idea.votes}
          </button>
          <button className="flex items-center text-purple-400 hover:text-purple-300 transition">
            <MessageCircle className="w-5 h-5 mr-1"/> View Comments
          </button>
        </div>
        <span className="text-xs font-mono text-yellow-500">Rank: #{idea.rank}</span>
      </div>
    </div>
  );

  const sortedIdeas = useMemo(() => {
    let sorted = [...MOCK_IDEAS];
    if (filter === 'Most Voted') {
      return sorted.sort((a, b) => b.votes - a.votes);
    }
    if (filter === 'New Ideas') {
      return sorted;
    }
    if (filter === 'AI Recommended') {
      return sorted.filter(i => i.potential === 'High');
    }
    return sorted;
  }, [filter]);

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white">Community Voting Feed</h1>
      <div className="flex space-x-3 border-b border-purple-700 pb-4 overflow-x-auto">
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm transition
              ${filter === f ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/40' : 'bg-gray-700 text-purple-300 hover:bg-gray-600'}
            `}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {sortedIdeas.map(idea => <IdeaTile key={idea.id} idea={idea} />)}
      </div>
    </div>
  );
};

const TopInnovatorsScreen = () => {
  const innovators = [
    { name: 'Alice R.', rank: 'Diamond', votes: 5200, ideas: 8, color: 'yellow' },
    { name: 'Bob K.', rank: 'Platinum', votes: 3100, ideas: 5, color: 'purple' },
    { name: 'Charlie P.', rank: 'Gold', votes: 1500, ideas: 3, color: 'amber' },
    { name: 'Diana V.', rank: 'Silver', votes: 850, ideas: 2, color: 'gray' },
  ];

  const getRankStyle = (rank: string) => {
    switch (rank) {
      case 'Diamond': return 'from-blue-400 to-cyan-400 ring-4 ring-cyan-200';
      case 'Platinum': return 'from-gray-300 to-gray-500 ring-4 ring-gray-400';
      case 'Gold': return 'from-yellow-500 to-amber-500 ring-4 ring-yellow-300';
      case 'Silver': return 'from-gray-400 to-gray-600 ring-2 ring-gray-500';
      default: return 'from-purple-600 to-pink-600';
    }
  };

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl text-white flex items-center">
        <Diamond className="w-8 h-8 mr-2 text-pink-500"/> Top Innovators & Hall of Fame
      </h1>

      <CustomCard title="Monthly Scoreboard" className="bg-gradient-to-tr from-gray-800 to-purple-900">
        <div className="flex overflow-x-auto space-x-6 pb-4">
          {innovators.map((inv, index) => (
            <div
              key={inv.name}
              className={`flex-shrink-0 w-64 p-6 rounded-2xl text-center shadow-2xl transition duration-300
                bg-gray-700/70 border border-t-4 border-pink-500
                ${index === 0 ? 'scale-105 shadow-pink-500/50' : 'hover:scale-[1.03]'}
              `}
            >
              <div className={`mx-auto w-20 h-20 rounded-full mb-3 flex items-center justify-center text-3xl
                bg-gradient-to-r ${getRankStyle(inv.rank)}`}>
                <User className="w-10 h-10"/>
              </div>
              <p className="text-2xl text-white mb-1">{inv.name}</p>
              <span className={`text-lg text-transparent bg-clip-text bg-gradient-to-r ${getRankStyle(inv.rank)}`}>
                {inv.rank} Innovator
              </span>
              <div className="mt-4 flex justify-around text-center">
                <div>
                  <p className="text-xl text-yellow-400">{inv.votes}</p>
                  <p className="text-sm text-gray-400">Total Votes</p>
                </div>
                <div>
                  <p className="text-xl text-pink-400">{inv.ideas}</p>
                  <p className="text-sm text-gray-400">Ideas Accepted</p>
                </div>
              </div>
              {index === 0 && (
                <div className="mt-4 p-2 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-lg text-gray-900 text-sm animate-pulse">
                  ✨ Monthly Reward Banner: Glow Coin Boost!
                </div>
              )}
            </div>
          ))}
        </div>
      </CustomCard>

      <CustomCard title="Hall of Fame - Innovation History">
        <div className="max-h-72 overflow-y-auto space-y-3 pr-2">
          {Array(10).fill(0).map((_, i) => (
            <div key={i} className="flex justify-between items-center p-3 bg-gray-700/50 rounded-lg hover:bg-gray-600 transition">
              <span className="text-purple-300">Q3 2024 Innovator: Alex G.</span>
              <span className="text-sm text-gray-400">Total Score: 10,200</span>
            </div>
          ))}
        </div>
      </CustomCard>
    </div>
  );
};

const NDAVaultScreen = () => {
  const securedIdeas = [
    { id: 1, title: 'AI-Powered Skincare Diagnostic', timestamp: '2025-09-15', chainID: 'GC-1A2B3C4D' },
    { id: 2, title: 'Decentralized Energy Grid App', timestamp: '2025-08-22', chainID: 'GC-2D3E4F5A' },
  ];
  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white flex items-center">
        <Lock className="w-8 h-8 mr-2 text-red-500"/> NDA Vault & Legal Shield
      </h1>
      <p className="text-gray-400">Your revolutionary ideas are protected. All submitted documents are securely time-stamped and linked to the **Glow Chain ID** ledger.</p>

      <CustomCard title="Secured Ideas">
        <div className="space-y-3">
          {securedIdeas.map(idea => (
            <div key={idea.id} className="p-4 bg-gray-700/50 rounded-xl flex justify-between items-center border border-red-700/50">
              <div>
                <p className="text-white">{idea.title}</p>
                <p className="text-xs text-red-300 mt-1">
                  Secure Timestamp: {idea.timestamp}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-mono text-gray-400">Glow Chain ID</p>
                <p className="text-sm text-yellow-400">{idea.chainID}</p>
              </div>
            </div>
          ))}
        </div>
      </CustomCard>

      <CustomCard title="My Legal Proofs">
        <div className="flex justify-between items-center">
          <p className="text-purple-300">Download all signed NDA PDFs and Uniqueness Reports.</p>
          <button className="py-2 px-4 rounded-full bg-red-600 text-white hover:bg-red-500 transition">
            Download Vault
          </button>
        </div>
      </CustomCard>
    </div>
  );
};

const AIPitchDeckScreen = () => {
  const themes = [
    { name: "Lavender–Gold Corporate", color: 'bg-purple-600', shadow: 'shadow-purple-500/50' },
    { name: "Pink Vibrant Startup", color: 'bg-pink-600', shadow: 'shadow-pink-500/50' },
    { name: "Blue Tech Minimal", color: 'bg-blue-600', shadow: 'shadow-blue-500/50' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white flex items-center">
        <ScrollText className="w-8 h-8 mr-2 text-purple-500"/> AI Pitch Deck Generator
      </h1>
      <p className="text-gray-400">Instantly generate a professional 5-8 slide pitch deck for your idea using advanced presentation algorithms.</p>

      <CustomCard title="Select Theme & Generate">
        <p className="mb-3 text-purple-300">Pitch Deck Theme:</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {themes.map(theme => (
            <button key={theme.name} className={`
              ${theme.color} text-white p-4 rounded-xl shadow-lg
              hover:opacity-80 transition duration-300
            `}>
              {theme.name}
            </button>
          ))}
        </div>
        <GlowingButton className="w-full">
          ⚡ Generate 8-Slide Deck
        </GlowingButton>
      </CustomCard>

      <CustomCard title="Output Options">
        <p className="text-sm text-gray-400 mb-4">Deck Generated for "AI-Powered Skincare Diagnostic"</p>
        <div className="grid grid-cols-3 gap-4">
          <button className="py-3 px-2 bg-gray-700 text-purple-300 rounded-xl hover:bg-gray-600 transition">
            View in App
          </button>
          <button className="py-3 px-2 bg-gray-700 text-purple-300 rounded-xl hover:bg-gray-600 transition">
            Export PDF
          </button>
          <button className="py-3 px-2 bg-green-600 text-white rounded-xl hover:bg-green-500 transition">
            Submit to Investor
          </button>
        </div>
      </CustomCard>
    </div>
  );
};

const MentorHubScreen = () => (
  <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
    <h1 className="text-3xl text-white flex items-center">
      <BookOpen className="w-8 h-8 mr-2 text-green-500"/> Mentor & Collaboration Hub
    </h1>
    <p className="text-gray-400">Connect with industry experts to refine your pitch and accelerate your development.</p>

    <CustomCard title="Book a Mentor Session">
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
          <p className="text-white">Beauty Tech Specialist (Dr. Lena)</p>
          <button className="py-1 px-3 bg-pink-600 text-white rounded-full text-sm hover:bg-pink-500">Book Slot</button>
        </div>
        <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
          <p className="text-white">AI Product Development (Mr. Sam)</p>
          <button className="py-1 px-3 bg-pink-600 text-white rounded-full text-sm hover:bg-pink-500">Book Slot</button>
        </div>
      </div>
    </CustomCard>

    <CustomCard title="Virtual Mentor Room">
      <p className="text-purple-300 mb-3">Join a virtual meeting room for real-time guidance.</p>
      <button className="py-2 px-4 bg-green-600 text-white rounded-xl hover:bg-green-500 transition">
        🎥 Join Voice/Video Room
      </button>
    </CustomCard>

    <CustomCard title="ChatGPT-Powered AI Mentor">
      <p className="text-sm text-gray-400 mb-3">Ask basic Q&A instantly without booking a human mentor.</p>
      <textarea
        placeholder="Ask the AI Mentor: 'What is the fastest way to prototype a mobile app?'"
        rows={3}
        className="w-full p-3 rounded-lg bg-gray-700 border border-green-600 focus:ring-2 focus:ring-pink-500 text-white"
      />
      <button className="mt-3 py-2 px-4 bg-gray-600 text-white rounded-xl hover:bg-gray-500 transition">
        Send Query
      </button>
    </CustomCard>
  </div>
);

const RewardsScreen = () => {
  const mockEarnings = {
    coins: 1250,
    acceptedIdeas: 3,
    monthlyRank: 15,
  };
  const rewards = [
    { name: '1000 Coins', type: 'Product Gift', value: 'Exclusive Beta Access' },
    { name: '500 Coins', type: 'Subscription', value: '1-Month Pro Plan' },
    { name: '2000 Coins', type: 'Cash-Out', value: '$50.00' },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl text-white flex items-center">
        <Diamond className="w-8 h-8 mr-2 text-amber-500"/> Rewards & Glow Coins
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CustomCard title="Total Glow Coins" className="text-center border-yellow-500/50 bg-yellow-900/40">
          <p className="text-6xl text-yellow-400">{mockEarnings.coins}</p>
          <p className="text-sm text-gray-400 mt-2">Earned through votes & sponsors</p>
        </CustomCard>
        <CustomCard title="Accepted Ideas" className="text-center">
          <p className="text-6xl text-pink-400">{mockEarnings.acceptedIdeas}</p>
          <p className="text-sm text-gray-400 mt-2">Currently being developed</p>
        </CustomCard>
        <CustomCard title="Monthly Rank" className="text-center">
          <p className="text-6xl text-purple-400">#{mockEarnings.monthlyRank}</p>
          <p className="text-sm text-gray-400 mt-2">Target Top 10 for Bonus</p>
        </CustomCard>
      </div>

      <CustomCard title="Redeem Glow Coins">
        <div className="space-y-3">
          {rewards.map(reward => (
            <div key={reward.name} className="p-4 bg-gray-700/50 rounded-xl flex justify-between items-center">
              <div>
                <p className="text-white">{reward.name}</p>
                <p className="text-sm text-purple-300">{reward.value}</p>
              </div>
              <button className="py-2 px-4 bg-amber-600 text-gray-900 rounded-full hover:bg-amber-500 transition">
                Redeem
              </button>
            </div>
          ))}
        </div>
      </CustomCard>
    </div>
  );
};

const PlaceholderScreen = ({ title }: { title: string }) => (
  <div className="p-8 text-center max-w-3xl mx-auto">
    <h1 className="text-4xl text-white mb-4">{title}</h1>
    <CustomCard className="py-12">
      <Zap className="w-16 h-16 mx-auto text-pink-500 mb-4 animate-bounce"/>
      <p className="text-xl text-purple-300">Screen under construction.</p>
      <p className="text-gray-400 mt-2">This feature will be available soon with full {title} integration.</p>
    </CustomCard>
  </div>
);

// --- LAYOUT COMPONENTS ---

const Sidebar = ({ currentPage, onNavigate, isExpanded, onToggleExpand }: {
  currentPage: string;
  onNavigate: (page: string) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) => {
  return (
    <div className={`
      h-full bg-gray-900/80 backdrop-blur-sm border-r border-purple-700/50
      transition-all duration-300 ease-in-out z-20 shadow-2xl shadow-black/50
      ${isExpanded ? 'w-64' : 'w-20'}
      flex flex-col relative
    `}>
      <div className="flex items-center justify-between p-4 border-b border-purple-700/50">
        {isExpanded && <h1 className="text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400">Innovators Hub</h1>}
        <IconButton
          icon={ChevronRight}
          label="Toggle Sidebar"
          onClick={onToggleExpand}
          className={`
            ${!isExpanded && 'mx-auto'}
            ${!isExpanded ? 'rotate-180' : 'rotate-0'}
            text-white hover:bg-purple-700
            transition-transform duration-300
          `}
        />
      </div>

      <nav className="flex-1 p-3 space-y-2 overflow-y-auto">
        {NAV_MAP.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
                <button
                    key={item.page}
                    onClick={() => onNavigate(item.page)}
                    className={`
                      w-full flex items-center p-3 rounded-xl transition-colors duration-200 group
                      ${isExpanded ? 'justify-start' : 'justify-center'}
                      ${isActive
                        ? `bg-pink-700/50 text-white shadow-lg shadow-pink-500/30 border border-pink-500`
                        : 'text-gray-300 hover:bg-purple-700/50 hover:text-white'
                      }
                    `}
                    title={item.name}
                >
                    <Icon className={`w-6 h-6 ${isExpanded ? 'mr-3' : ''} ${isActive ? `text-pink-400` : ''}`} />
                    <span className={`overflow-hidden whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0'}`}>
                      {item.name}
                    </span>
                </button>
            )
        })}
      </nav>
    </div>
  );
};

const Navbar = ({ onToggleSidebar, onNavigate, onNavigateHome }: {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  onNavigateHome: () => void;
}) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-sm h-16 flex items-center justify-between px-6 z-10 shadow-xl shadow-black/50 border-b border-purple-700/50">
      <div className="flex items-center space-x-3">
        <IconButton icon={Menu} label="Toggle Menu" onClick={onToggleSidebar} className="lg:hidden text-white hover:bg-purple-700/50" />
        <button
          onClick={onNavigateHome}
          className="p-2 rounded-full text-purple-200 hover:bg-white/10 hover:text-white transition"
          title="Back to Mithas Glow Home"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="text-2xl text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-400 ml-4 hidden lg:block">
          Innovators Hub
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={() => onNavigate('voting')} className="text-purple-300 hover:text-white hidden sm:block">
          🔍 Explore Ideas
        </button>
        <button onClick={() => onNavigate('vault')} className="text-purple-300 hover:text-white hidden sm:block">
          🧠 My Ideas
        </button>

        <IconButton icon={Bell} label="Notifications" onClick={() => toast.info('No new notifications')} badge={2} />
        <IconButton icon={Settings} label="Settings" onClick={() => onNavigate('settings')} />

        <div className="flex items-center space-x-2 p-2 rounded-full bg-purple-700/50 border border-purple-600 cursor-pointer hover:bg-purple-600 transition">
          <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm">
            JD
          </div>
          <span className="text-sm text-white hidden sm:inline">John Doe</span>
          <User className="w-4 h-4 text-purple-300"/>
        </div>
      </div>
    </header>
  );
};

// --- MAIN COMPONENT ---

interface InnovatorsHubScreenProps {
  onNavigateHome: () => void;
}

export function InnovatorsHubScreen({ onNavigateHome }: InnovatorsHubScreenProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [routeParams, setRouteParams] = useState<any>(null);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const handleNavigate = (page: string, params: any = null) => {
    setCurrentPage(page);
    setRouteParams(params);
  };

  const renderScreen = () => {
    switch (currentPage) {
      case 'dashboard':
        return <HomeDashboard onNavigate={handleNavigate} />;
      case 'submit':
        return <SubmitIdeaScreen onNavigate={handleNavigate} />;
      case 'analyzer':
        return <AIAnalyzerScreen routeParams={routeParams} onNavigate={handleNavigate} />;
      case 'voting':
        return <CommunityVotingScreen onNavigate={handleNavigate} />;
      case 'innovators':
        return <TopInnovatorsScreen />;
      case 'vault':
        return <NDAVaultScreen />;
      case 'pitchdeck':
        return <AIPitchDeckScreen />;
      case 'mentor':
        return <MentorHubScreen />;
      case 'rewards':
        return <RewardsScreen />;
      case 'investor':
        return <PlaceholderScreen title="Investor Connect" />;
      case 'settings':
        return <PlaceholderScreen title="Settings / NDA Vault Management" />;
      default:
        return <HomeDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <BackgroundGlow>
      <div className="flex h-screen w-full font-sans antialiased overflow-hidden">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isExpanded={isSidebarExpanded}
          onToggleExpand={() => setIsSidebarExpanded(prev => !prev)}
        />

        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar 
            onToggleSidebar={() => setIsSidebarExpanded(prev => !prev)} 
            onNavigate={handleNavigate}
            onNavigateHome={onNavigateHome}
          />

          <main className="flex-1 overflow-y-auto">
            {renderScreen()}
          </main>
        </div>
      </div>
    </BackgroundGlow>
  );
}
