
import React from 'react';
import { Project, ContentBlock } from '../types';

interface ProjectDetailProps {
  project: Project;
  allProjects: Project[];
  onProjectSelect: (slug: string) => void;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, allProjects, onProjectSelect, onBack }) => {
  const isVideo = (url: string) => url?.startsWith('data:video') || url?.endsWith('.mp4') || url?.endsWith('.webm');

  const renderBlock = (block: ContentBlock) => {
    const spacing = block.settings?.verticalSpacing || 'py-32'; // Increased default spacing for premium feel

    switch (block.type) {
      case 'video':
        return (
          <section key={block.id} className={`bg-[#0E0E0E] ${spacing} w-full overflow-hidden flex justify-center`}>
            <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12">
              <div 
                className="w-full [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:max-h-[85vh]"
                dangerouslySetInnerHTML={{ __html: block.data }} 
              />
            </div>
          </section>
        );

      case 'concept':
        return (
          <section key={block.id} className={`w-full max-w-7xl mx-auto px-6 lg:px-12 ${spacing} border-t border-white/5`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-32 items-start pt-20">
              <div className="space-y-16">
                <div className="space-y-4">
                  <span className="text-[10px] tracking-[0.5em] text-purple-500 uppercase font-bold font-sans block">01 / Logic</span>
                  <h2 className="text-3xl font-serif uppercase tracking-tight">Concept & Direction</h2>
                </div>
                
                <div className="space-y-16">
                  <div className="group">
                    <h3 className="text-xs font-bold mb-4 tracking-[0.2em] uppercase text-white/30 group-hover:text-purple-400 transition-colors duration-500 font-sans">01. Background</h3>
                    <p className="text-white/70 leading-relaxed font-light text-lg font-sans max-w-xl">
                      {block.data.background}
                    </p>
                  </div>
                  <div className="group">
                    <h3 className="text-xs font-bold mb-4 tracking-[0.2em] uppercase text-white/30 group-hover:text-purple-400 transition-colors duration-500 font-sans">02. Visual Strategy</h3>
                    <p className="text-white/70 leading-relaxed font-light text-lg font-sans max-w-xl">
                      {block.data.visualStrategy}
                    </p>
                  </div>
                  <div className="group">
                    <h3 className="text-xs font-bold mb-4 tracking-[0.2em] uppercase text-white/30 group-hover:text-purple-400 transition-colors duration-500 font-sans">03. Message</h3>
                    <p className="text-white/70 leading-relaxed font-light text-lg font-sans max-w-xl">
                      {block.data.message}
                    </p>
                  </div>
                </div>
              </div>

              <div className="w-full sticky top-40">
                <div className="aspect-[4/5] bg-white/[0.03] border border-white/5 overflow-hidden">
                   {block.data.imageUrl ? (
                     isVideo(block.data.imageUrl) ? (
                       <video src={block.data.imageUrl} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                     ) : (
                       <img src={block.data.imageUrl} className="w-full h-full object-cover" alt="Concept Visualization" />
                     )
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-[10px] tracking-[0.5em] text-white/10 uppercase italic font-sans">
                       Conceptual Reference
                     </div>
                   )}
                </div>
                <div className="mt-6 flex items-center gap-4 text-[9px] tracking-[0.3em] text-white/20 uppercase font-bold">
                   <div className="w-8 h-px bg-white/10" />
                   Key Visual Study
                </div>
              </div>
            </div>
          </section>
        );

      case 'large-image':
        return (
          <section key={block.id} className={`w-full ${spacing} flex justify-center px-6 lg:px-12`}>
            <div className={`${block.settings?.width || 'w-full'} max-w-[1400px] overflow-hidden bg-white/5`}>
               {isVideo(block.data) ? (
                 <video src={block.data} autoPlay muted loop playsInline className="w-full h-auto" />
               ) : (
                 <img src={block.data} className="w-full h-auto" alt="Visual Detail" />
               )}
            </div>
          </section>
        );

      case 'grid-gallery':
        const gridCols = block.settings?.columns || 2;
        const colClass = gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' : gridCols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
        return (
          <section key={block.id} className={`max-w-[1400px] mx-auto px-6 lg:px-12 ${spacing}`}>
            <div className={`grid ${colClass} gap-6 lg:gap-8 items-start`}>
              {block.data.map((img: string, idx: number) => (
                <div key={idx} className="w-full overflow-hidden bg-white/5 group">
                   {isVideo(img) ? (
                     <video src={img} autoPlay muted loop playsInline className="w-full h-auto group-hover:scale-105 transition-transform duration-1000 ease-out" />
                   ) : (
                     <img src={img} className="w-full h-auto group-hover:scale-105 transition-transform duration-1000 ease-out" alt="" />
                   )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'text':
        const fontClass = block.settings?.fontFamily === 'font-serif' ? 'font-serif font-bold tracking-tight' : 'font-sans font-light';
        return (
          <section key={block.id} className={`max-w-7xl mx-auto px-6 lg:px-12 ${spacing} ${block.settings?.textAlign} ${fontClass}`}>
            <div className={`${block.settings?.fontSize} leading-snug text-white/90 whitespace-pre-wrap max-w-4xl mx-auto`}>
              {block.data}
            </div>
          </section>
        );

      case 'storyboard':
        return (
          <section key={block.id} className={`bg-white/[0.01] ${spacing} border-t border-b border-white/5 overflow-hidden`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <header className="mb-20">
                <span className="text-[10px] tracking-[0.5em] text-purple-400 uppercase font-bold font-sans block mb-4">Narrative</span>
                <h2 className="text-4xl font-serif uppercase tracking-tight">Visual Storyboarding</h2>
              </header>
              <div className="flex overflow-x-auto gap-12 pb-16 custom-scrollbar scroll-smooth">
                {block.data.map((img: string, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-[500px] overflow-hidden bg-white/5">
                    {isVideo(img) ? <video src={img} autoPlay muted loop playsInline className="w-full h-auto" /> : <img src={img} className="w-full h-auto" alt="" />}
                    <div className="p-4 bg-black/40 backdrop-blur-sm border-t border-white/5">
                      <span className="text-[9px] tracking-widest text-white/30 uppercase font-bold">Frame 0{idx + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key={block.id} className={`max-w-7xl mx-auto px-6 lg:px-12 ${spacing}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              {block.data.map((img: string, idx: number) => (
                <div key={idx} className={`${idx === 0 ? 'md:col-span-2' : ''} overflow-hidden bg-white/5`}>
                  {isVideo(img) ? <video src={img} autoPlay muted loop playsInline className="w-full h-auto" /> : <img src={img} className="w-full h-auto" alt="" />}
                </div>
              ))}
            </div>
          </section>
        );

      case 'process':
        return (
          <section key={block.id} className={`bg-[#0A0A0A] ${spacing} border-t border-white/5 pt-32`}>
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center mb-32 space-y-6">
                <span className="text-[10px] tracking-[0.6em] text-white/30 uppercase font-bold font-sans">Behind the Curtains</span>
                <h2 className="text-5xl font-serif uppercase tracking-tighter">Process Milestones</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20 items-start">
                {block.data.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-8 group">
                    <div className="w-full aspect-video bg-white/5 overflow-hidden border border-white/5 group-hover:border-purple-500/30 transition-colors duration-500">
                      {isVideo(item.imageUrl) ? <video src={item.imageUrl} autoPlay muted loop playsInline className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" /> : <img src={item.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" alt="" />}
                    </div>
                    <div className="space-y-2">
                      <span className="text-[9px] tracking-[0.4em] uppercase font-bold text-purple-500 block">Step 0{idx + 1}</span>
                      <p className="text-lg font-light text-white/60 font-sans group-hover:text-white transition-colors">{item.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0E0E0E] selection:bg-purple-500/30">
      {/* Side Bar - Archive Navigation */}
      <aside className="hidden lg:flex flex-col w-72 h-screen sticky top-0 border-r border-white/5 bg-[#0E0E0E] z-40 overflow-hidden pt-28">
        <div className="px-10 mb-12">
          <span className="text-[10px] tracking-[0.5em] text-white/20 uppercase font-bold block mb-4">Collection</span>
          <div className="w-10 h-px bg-purple-500/50" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-8 custom-scrollbar space-y-8">
          {allProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => onProjectSelect(p.slug)}
              className={`group flex flex-col items-start w-full transition-all duration-700 ${
                p.slug === project.slug ? 'opacity-100' : 'opacity-20 hover:opacity-100'
              }`}
            >
              <div className="relative w-full aspect-video overflow-hidden bg-white/5 mb-4 group-hover:shadow-purple-500/10">
                 {isVideo(p.thumbnailUrl) ? (
                   <video src={p.thumbnailUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                 ) : (
                   <img src={p.thumbnailUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="" />
                 )}
                 {p.slug === project.slug && (
                    <div className="absolute inset-0 border border-purple-500/40" />
                 )}
              </div>
              <p className={`text-[10px] tracking-[0.2em] uppercase font-bold truncate w-full text-left transition-colors duration-500 ${
                p.slug === project.slug ? 'text-purple-400' : 'text-white/40'
              }`}>
                {p.title}
              </p>
            </button>
          ))}
        </div>

        <div className="p-10 border-t border-white/5 bg-[#0D0D0D]">
          <button 
            onClick={onBack}
            className="text-[10px] tracking-[0.5em] text-white/40 hover:text-purple-400 uppercase font-bold transition-all flex items-center gap-4 group"
          >
            <span className="group-hover:-translate-x-2 transition-transform duration-500">←</span>
            GO BACK
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-64">
        {/* Header Section - Tightened Spacing */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-10">
          <div className="flex flex-col gap-8 mb-12">
            <div className="space-y-6 max-w-5xl">
              <div className="flex items-center gap-6">
                 <span className="text-[10px] tracking-[0.6em] text-purple-400 uppercase font-bold font-sans">Project Feature</span>
                 <div className="h-px w-20 bg-white/5" />
              </div>
              <h1 className="text-5xl md:text-7xl font-serif leading-[0.9] tracking-tighter uppercase mb-8">
                {project.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/40 font-light leading-snug italic font-sans max-w-4xl border-l border-white/10 pl-8">
                {project.shortDesc}
              </p>
            </div>
            
            <div className="flex justify-between items-end">
               <button onClick={onBack} className="lg:hidden text-[10px] tracking-[0.5em] text-purple-400 hover:text-white uppercase font-bold border-b border-purple-500/30 pb-2 transition-all font-sans">
                 Exit Project
               </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-b border-white/5 text-[11px] font-sans">
            <div className="space-y-2">
              <p className="text-white/20 tracking-[0.4em] uppercase font-bold">Duration</p>
              <p className="text-white/80 font-medium tracking-widest">{project.duration}</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/20 tracking-[0.4em] uppercase font-bold">Year</p>
              <p className="text-white/80 font-medium tracking-widest">{project.year}</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/20 tracking-[0.4em] uppercase font-bold">Role</p>
              <p className="text-white/80 font-medium tracking-widest uppercase">{project.role}</p>
            </div>
            <div className="space-y-2">
              <p className="text-white/20 tracking-[0.4em] uppercase font-bold">Tools Stack</p>
              <p className="text-purple-300 font-bold tracking-wider">{project.tools.join(' · ')}</p>
            </div>
          </div>
        </section>

        {/* Render Content Blocks */}
        <div className="flex flex-col">
          {project.blocks.map(renderBlock)}
        </div>

        {/* Footer Navigation */}
        <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-64 pb-20 text-center">
           <div className="mb-20 w-12 h-12 border border-white/10 rounded-full flex items-center justify-center mx-auto animate-bounce opacity-30">
              <span className="text-[10px] text-white">↓</span>
           </div>
           <button 
             onClick={onBack} 
             className="relative group px-20 py-8 overflow-hidden transition-all duration-700"
           >
             <div className="absolute inset-0 border border-white/10 group-hover:border-purple-500/50 transition-colors duration-500" />
             <div className="absolute inset-0 bg-purple-600 translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out" />
             <span className="relative text-[10px] tracking-[0.8em] font-bold uppercase text-white/40 group-hover:text-white transition-colors duration-500">
               Return to Archive
             </span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
