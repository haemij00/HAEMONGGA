
import React from 'react';
import { Profile } from '../types';

interface FooterProps {
  profile: Profile;
}

const Footer: React.FC<FooterProps> = ({ profile }) => {
  return (
    <footer className="py-12 border-t border-white/5 bg-[#0A0A0A] shrink-0">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-white/40 text-[10px] tracking-widest uppercase font-bold text-center md:text-left">
          © 2025 HAEMONGA (HAEMI JEON). ALL RIGHTS RESERVED.
        </div>
        <div className="flex space-x-12">
          <a 
            href={profile.behance} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/20 hover:text-purple-400 transition-colors text-[10px] tracking-[0.3em] font-bold"
          >
            BEHANCE
          </a>
          <a 
            href={profile.notefolio} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-white/20 hover:text-purple-400 transition-colors text-[10px] tracking-[0.3em] font-bold"
          >
            NOTEFOLIO
          </a>
          <a 
            href={`mailto:${profile.email}`} 
            className="text-white/20 hover:text-purple-400 transition-colors text-[10px] tracking-[0.3em] font-bold"
          >
            EMAIL
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;