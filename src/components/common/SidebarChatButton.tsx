import React from 'react';
import { MessageCircle } from 'lucide-react';

interface SidebarChatButtonProps {
  isActive: boolean;
  onClick: () => void;
}

const SidebarChatButton: React.FC<SidebarChatButtonProps> = ({ isActive, onClick }) => (
  <button
    className={`flex items-center gap-3 px-4 md:px-6 py-2 md:py-3 w-full text-left transition-all duration-200 border-l-3 border-transparent mx-1 text-blue-100 hover:bg-white/5 hover:text-white hover:border-l-blue-400 rounded-lg ${isActive ? 'bg-white/10 text-white border-l-white font-semibold' : ''}`}
    onClick={onClick}
    title="Chat"
    type="button"
  >
    <MessageCircle className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
    <span className="text-sm md:text-base truncate transition-opacity duration-300">Chat</span>
  </button>
);

export default SidebarChatButton;
