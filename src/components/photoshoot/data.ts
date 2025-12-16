export type PhotoshootMode = 'solo' | 'wedding' | 'cinematic' | 'local';

export interface LocationData {
  name: string;
  mood: string;
  effectClass: string;
  img: string;
  plan: 'free' | 'premium';
  price: number;
  sound: 'Synth' | 'Cello' | 'Noise' | 'Piano';
  guidance: GuidanceStep[];
}

export interface GuidanceStep {
  text: string;
  hint: 'wait' | 'ready' | '▲' | '▼' | '◀' | '▶';
}

export const LOCATION_DATA: Record<string, LocationData> = {
  'temple': {
    name: 'Traditional Temple Style 🕌',
    mood: 'Warm Sunrise Glow',
    effectClass: 'filter-temple',
    img: 'https://placehold.co/400x600/7a0d4b/ffffff?text=Traditional+Temple',
    plan: 'free',
    price: 0,
    sound: 'Synth',
    guidance: [
      { text: "Voice AI: Look at each other now... smile softly...", hint: 'wait' },
      { text: "Voice AI: Bride: Hand gently on Groom's shoulder.", hint: 'wait' },
      { text: "Voice AI: Groom: Turn chin 5 degrees left.", hint: '◀' },
      { text: "Voice AI: Hold that pose… capturing light rays…", hint: 'ready' },
    ],
  },
  'palace': {
    name: 'Royal Palace Shoot 👑',
    mood: 'Regal Midday Light',
    effectClass: 'filter-palace',
    img: 'https://placehold.co/400x600/3d0752/ffffff?text=Royal+Palace+Shoot',
    plan: 'premium',
    price: 499,
    sound: 'Cello',
    guidance: [
      { text: "Voice AI: Hold hands firmly. Strong stance.", hint: 'wait' },
      { text: "Voice AI: Bride: Chin slightly up for regal pose.", hint: '▲' },
      { text: "Voice AI: AI detecting jewelry reflection...", hint: 'wait' },
      { text: "Voice AI: Perfect, hold still… capturing light rays…", hint: 'ready' },
    ],
  },
  'maldives': {
    name: 'Maldives Beach Wedding 🏝️',
    mood: 'Soft Golden Hour Sunlight',
    effectClass: 'filter-maldives',
    img: 'https://placehold.co/400x600/9e5900/ffffff?text=Maldives+Golden+Hour',
    plan: 'premium',
    price: 499,
    sound: 'Noise',
    guidance: [
      { text: "Voice AI: Turn body left to catch the golden light.", hint: '◀' },
      { text: "Voice AI: Look past the horizon, slightly down.", hint: '▼' },
      { text: "Voice AI: Dupatta movement simulated (gentle breeze).", hint: 'wait' },
      { text: "Voice AI: Perfect, hold still… capturing light rays…", hint: 'ready' },
    ],
  },
  'paris': {
    name: 'Paris Dream Shoot 🗼',
    mood: 'Cloudy Daylight Tone',
    effectClass: 'filter-paris',
    img: 'https://placehold.co/400x600/4a5568/ffffff?text=Paris+Dream+Shoot',
    plan: 'premium',
    price: 799,
    sound: 'Piano',
    guidance: [
      { text: "Voice AI: Groom: Embrace the Bride gently from behind.", hint: 'wait' },
      { text: "Voice AI: Bride: Turn face 10 degrees right.", hint: '▶' },
      { text: "Voice AI: Hold the loving gaze. AI auto-re-capture active.", hint: 'wait' },
      { text: "Voice AI: Perfect, hold still… capturing light rays…", hint: 'ready' },
    ],
  },
};

export const POSE_HINTS: Record<string, { text: string }> = {
  '▲': { text: '▲ Chin Up' },
  '▼': { text: '▼ Chin Down' },
  '◀': { text: '◀ Turn Left' },
  '▶': { text: '▶ Turn Right' },
  'wait': { text: '✨ Hold Steady' },
  'ready': { text: '📸 Hold Pose: Capturing in 3...' },
};

export const ALL_FILTER_CLASSES = ['filter-temple', 'filter-palace', 'filter-maldives', 'filter-paris'];
