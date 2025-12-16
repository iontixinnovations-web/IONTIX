import { LucideIcon } from 'lucide-react';

// --- Theme Constants ---
export const MITHAS_PRIMARY = '#ff512f';
export const MITHAS_ACCENT = '#dd2476';

// --- Reusable Components ---

interface ButtonProps {
  title?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  isPrimary?: boolean;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export const Button = ({ 
  title, 
  onClick, 
  icon: Icon, 
  isPrimary = true, 
  className = "", 
  children,
  disabled = false 
}: ButtonProps) => {
  const baseStyle = "w-full flex items-center justify-center text-center px-4 py-3 rounded-xl transition duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed";
  const primaryStyle = "bg-gradient-to-r from-[#ff512f] to-[#dd2476] hover:opacity-90 text-white shadow-lg";
  const secondaryStyle = "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50";

  return (
    <button
      className={`${baseStyle} ${isPrimary ? primaryStyle : secondaryStyle} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon className="w-5 h-5 mr-2" />}
      {title || children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white p-4 rounded-xl shadow-lg border border-gray-100 ${className}`}>
    {children}
  </div>
);

interface InputProps {
  placeholder?: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  label?: string;
  className?: string;
  isTextArea?: boolean;
}

export const Input = ({ 
  placeholder, 
  type = 'text', 
  value, 
  onChange, 
  label, 
  className = "", 
  isTextArea = false 
}: InputProps) => (
  <div className="mb-4">
    {label && <label className="block text-sm text-gray-700 mb-1">{label}</label>}
    {isTextArea ? (
      <textarea
        className={`w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-y ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
      />
    ) : (
      <input
        type={type}
        className={`w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    )}
  </div>
);

interface DropdownProps {
  options: string[];
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const Dropdown = ({ options, label, value, onChange }: DropdownProps) => (
  <div className="mb-4">
    <label className="block text-sm text-gray-700 mb-1">{label}</label>
    <select
      className="w-full border border-gray-300 p-3 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
      value={value}
      onChange={onChange}
    >
      <option value="" disabled>Select {label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
);

interface ImagePickerProps {
  title: string;
  multiple?: boolean;
  onImageSelect?: (files: File | File[]) => void;
}

export const ImagePickerComponent = ({ title, multiple = false, onImageSelect }: ImagePickerProps) => {
  const safeTitle = title.replace(/\s/g, '-').toLowerCase();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && onImageSelect) {
      onImageSelect(multiple ? Array.from(e.target.files) : e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <label className="block text-sm text-gray-700">{title}</label>
      <label
        className="cursor-pointer"
        htmlFor={`image-upload-${safeTitle}`}
      >
        <div className="border-2 border-dashed border-gray-300 p-6 rounded-xl text-center hover:border-pink-500 transition-colors duration-200 bg-gray-50">
          <div className="mx-auto h-8 w-8 text-pink-500 mb-2 flex items-center justify-center">
            📸
          </div>
          <span className="text-pink-600">
            {multiple ? 'Click to Upload Multiple Photos' : 'Click to Upload Photo'}
          </span>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, or SVG allowed</p>
        </div>
      </label>
      <input
        type="file"
        id={`image-upload-${safeTitle}`}
        name={`image-upload-${safeTitle}`}
        className="hidden"
        multiple={multiple}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  className?: string;
}

export const SectionHeader = ({ title, icon: Icon, className = "" }: SectionHeaderProps) => (
  <h2 className={`text-xl text-gray-800 flex items-center mb-4 ${className}`}>
    {Icon && <Icon className="w-6 h-6 mr-2 text-pink-600" />}
    {title}
  </h2>
);

interface SummaryCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: 'primary' | 'accent';
  className?: string;
}

export const SummaryCard = ({ title, value, icon: Icon, color, className = "" }: SummaryCardProps) => (
  <Card className={`flex flex-col items-start ${className}`}>
    <div className={`p-2 rounded-full mb-2 ${color === 'primary' ? 'bg-red-50 text-red-600' : 'bg-pink-50 text-pink-600'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-2xl text-gray-900 mt-1">{value}</p>
  </Card>
);

interface TabBarProps {
  tabs: { id: string; title: string }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TabBar = ({ tabs, activeTab, onTabChange }: TabBarProps) => (
  <div className="flex space-x-2 border-b border-gray-200 mb-4 overflow-x-auto">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`py-2 px-4 whitespace-nowrap text-sm transition-colors duration-150 ${
          activeTab === tab.id
            ? 'border-b-4 border-pink-600 text-pink-600'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        {tab.title}
      </button>
    ))}
  </div>
);

interface ToggleSwitchProps {
  label: string;
  isChecked: boolean;
  onToggle: () => void;
}

export const ToggleSwitch = ({ label, isChecked, onToggle }: ToggleSwitchProps) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
    <span className="text-sm text-gray-700">{label}</span>
    <button
      onClick={onToggle}
      className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isChecked ? 'bg-pink-600' : 'bg-gray-200'}`}
      role="switch"
      aria-checked={isChecked}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${isChecked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  </div>
);
