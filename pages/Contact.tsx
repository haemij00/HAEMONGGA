
import React from 'react';
import { Profile } from '../types';

interface ContactProps {
  profile: Profile;
}

const Contact: React.FC<ContactProps> = ({ profile }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-1000 font-sans">
      <span className="text-xs tracking-[1em] text-purple-400 uppercase mb-8 block font-bold">Inquiry</span>
      
      {/* 폰트를 Pretendard Bold Italic으로 변경 (font-bold italic) */}
      <h1 className="text-4xl md:text-7xl font-bold italic text-center mb-16 tracking-tight leading-tight text-white max-w-5xl">
        Infusing the familiar with the <br/>
        <span className="text-white/60 underline decoration-1 underline-offset-[16px] inline-block mt-6">extraordinary.</span>
      </h1>

      {/* 스크린샷의 도트 포인트를 유지하여 미니멀한 마감 처리 */}
      <div className="mb-24 w-1.5 h-1.5 rounded-full bg-white/20" />

      <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
        <div className="text-center group cursor-pointer">
          <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mb-4 font-bold font-sans">Email</p>
          <a href={`mailto:${profile.email}`} className="text-2xl md:text-3xl font-light text-white hover:text-purple-400 transition-colors border-b border-transparent hover:border-purple-400 pb-1 font-sans">
            {profile.email}
          </a>
        </div>

        <div className="text-center group cursor-pointer">
          <p className="text-[10px] tracking-[0.5em] text-white/40 uppercase mb-4 font-bold font-sans">Social</p>
          <div className="flex space-x-12">
             <a 
              href={profile.behance} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lg tracking-[0.3em] text-white hover:text-purple-400 transition-colors font-bold uppercase font-sans"
             >
              BEHANCE
             </a>
             <a 
              href={profile.notefolio} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-lg tracking-[0.3em] text-white hover:text-purple-400 transition-colors font-bold uppercase font-sans"
             >
              NOTEFOLIO
             </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
