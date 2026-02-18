
import React, { useState } from 'react';

interface NavbarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onOpenAdmin: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentPage, onPageChange, onOpenAdmin }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'HOME' },
    { id: 'about', label: 'ABOUT' },
    { id: 'works', label: 'WORK' },
    { id: 'contact', label: 'CONTACT' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0E0E0E]/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div 
          className="cursor-pointer group flex items-center"
          onClick={() => onPageChange('home')}
        >
          <span className="text-lg font-bold tracking-tighter group-hover:text-purple-400 transition-colors uppercase">
            HAEMONGGA
          </span>
          <span className="mx-2 text-lg text-white/20">|</span>
          <span className="text-lg text-white/40 tracking-tight font-medium group-hover:text-purple-300 transition-colors uppercase">
            HAEMI JEON
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-12">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`text-xs tracking-[0.3em] transition-all hover:text-purple-400 ${
                currentPage === item.id ? 'text-white font-bold' : 'text-white/60'
              }`}
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={onOpenAdmin}
            className="w-4 h-4 rounded-full border border-white/20 hover:border-white/60 transition-colors"
            title="Admin"
          />
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0E0E0E] border-b border-white/10 absolute top-20 left-0 w-full p-8 flex flex-col space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onPageChange(item.id);
                setIsMenuOpen(false);
              }}
              className={`text-lg tracking-widest text-left ${
                currentPage === item.id ? 'text-purple-400' : 'text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
