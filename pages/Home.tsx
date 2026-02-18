
import React from 'react';

interface HomeProps {
  heroImageUrl: string;
  onNavigateToWorks: () => void;
}

const Home: React.FC<HomeProps> = ({ heroImageUrl, onNavigateToWorks }) => {
  return (
    <div className="animate-in fade-in duration-700">
      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        <div className="absolute inset-0 bg-[#0E0E0E]">
          <img 
            src={heroImageUrl} 
            className="w-full h-full object-cover opacity-50 mix-blend-luminosity"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-[#0E0E0E]" />
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-12 tracking-[0.25em] animate-in slide-in-from-bottom-8 duration-1000 uppercase text-ghost-vertical">
            PORTFOLIO
          </h1>
          
          <p className="text-lg md:text-xl font-medium tracking-[0.2em] mb-16 animate-in slide-in-from-bottom-10 duration-1000 delay-100 text-ghost-vertical">
            Jeon Haemi
          </p>
          
          <div className="space-y-4 mb-20 animate-in slide-in-from-bottom-12 duration-1000 delay-200">
            <p className="text-[10px] md:text-xs text-white/60 tracking-[0.5em] font-bold uppercase">
              3D Generalist & Motion Designer
            </p>
            <p className="text-[9px] md:text-[10px] text-white/30 tracking-[0.5em] uppercase">
              Surreal & Symbolic Visual Storytelling
            </p>
          </div>

          <button 
            onClick={onNavigateToWorks}
            className="group flex flex-col items-center space-y-6 animate-in fade-in duration-1000 delay-500"
          >
            <span className="text-[9px] tracking-[0.6em] text-white/20 group-hover:text-purple-400 transition-colors uppercase font-medium">View Selected Works</span>
            <div className="w-px h-16 bg-gradient-to-b from-purple-500/50 to-transparent group-hover:h-24 transition-all duration-700" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
