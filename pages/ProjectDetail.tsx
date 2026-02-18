
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
    const spacing = block.settings?.verticalSpacing || 'py-24'; // Default spacing

    switch (block.type) {
      case 'video':
        return (
          <section key={block.id} className={`bg-black ${spacing} w-full overflow-hidden`}>
            <div className="w-full max-w-[1920px] mx-auto shadow-2xl">
              <div 
                className="w-full [&>iframe]:w-full [&>iframe]:aspect-video [&>iframe]:max-h-[90vh]"
                dangerouslySetInnerHTML={{ __html: block.data }} 
              />
            </div>
          </section>
        );

      case 'concept':
        return (
          <section key={block.id} className={`max-w-7xl mx-auto px-6 ${spacing} border-t border-white/5`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
              <div className="space-y-12">
                <span className="text-xs tracking-[0.4em] text-purple-400 uppercase block font-bold font-sans">Concept & Direction</span>
                <div className="space-y-12">
                  <div>
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase border-l-2 border-purple-500 pl-4 font-serif">01. Background</h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg font-sans">{block.data.background}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase border-l-2 border-purple-500 pl-4 font-serif">02. Visual Strategy</h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg font-sans">{block.data.visualStrategy}</p>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-4 tracking-widest uppercase border-l-2 border-purple-500 pl-4 font-serif">03. Message</h3>
                    <p className="text-white/60 leading-relaxed font-light text-lg font-sans">{block.data.message}</p>
                  </div>
                </div>
              </div>
              <div className="w-full bg-white/5 rounded-sm overflow-hidden sticky top-32">
                 {block.data.imageUrl ? (
                   isVideo(block.data.imageUrl) ? (
                     <video src={block.data.imageUrl} autoPlay muted loop playsInline className="w-full h-auto object-contain" />
                   ) : (
                     <img src={block.data.imageUrl} className="w-full h-auto object-contain" alt="Concept Visualization" />
                   )
                 ) : (
                   <div className="aspect-[4/5] w-full flex items-center justify-center text-white/5 italic font-sans">Conceptual Space</div>
                 )}
              </div>
            </div>
          </section>
        );

      case 'large-image':
        return (
          <section key={block.id} className={`w-full ${spacing} flex justify-center`}>
            <div className={`${block.settings?.width || 'w-full'} max-w-[1920px] shadow-2xl overflow-hidden`}>
               {isVideo(block.data) ? (
                 <video src={block.data} autoPlay muted loop playsInline className="w-full h-auto" />
               ) : (
                 <img src={block.data} className="w-full h-auto" alt="Visual" />
               )}
            </div>
          </section>
        );

      case 'grid-gallery':
        const gridCols = block.settings?.columns || 2;
        const colClass = gridCols === 2 ? 'grid-cols-1 md:grid-cols-2' : gridCols === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2 md:grid-cols-4';
        return (
          <section key={block.id} className={`max-w-[1920px] mx-auto px-6 ${spacing}`}>
            <div className={`grid ${colClass} gap-4 items-start`}>
              {block.data.map((img: string, idx: number) => (
                <div key={idx} className="w-full overflow-hidden bg-white/5 group">
                   {isVideo(img) ? (
                     <video src={img} autoPlay muted loop playsInline className="w-full h-auto group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <img src={img} className="w-full h-auto group-hover:scale-105 transition-transform duration-700" alt="" />
                   )}
                </div>
              ))}
            </div>
          </section>
        );

      case 'text':
        const fontClass = block.settings?.fontFamily === 'font-serif' ? 'font-serif font-bold tracking-tight' : 'font-sans font-light';
        return (
          <section key={block.id} className={`max-w-7xl mx-auto px-6 ${spacing} ${block.settings?.textAlign} ${fontClass}`}>
            <div className={`${block.settings?.fontSize} leading-tight text-white/90 whitespace-pre-wrap max-w-5xl mx-auto`}>
              {block.data}
            </div>
          </section>
        );

      case 'storyboard':
        return (
          <section key={block.id} className={`bg-white/[0.02] ${spacing} border-t border-white/5 overflow-hidden`}>
            <div className="max-w-7xl mx-auto px-6">
              <header className="mb-16"><h2 className="text-3xl font-serif">Visual Storyboarding</h2></header>
              <div className="flex overflow-x-auto gap-8 pb-12 custom-scrollbar">
                {block.data.map((img: string, idx: number) => (
                  <div key={idx} className="flex-shrink-0 w-[450px] overflow-hidden shadow-xl">
                    {isVideo(img) ? <video src={img} autoPlay muted loop playsInline className="w-full h-auto" /> : <img src={img} className="w-full h-auto" alt="" />}
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case 'gallery':
        return (
          <section key={block.id} className={`max-w-7xl mx-auto px-6 ${spacing}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {block.data.map((img: string, idx: number) => (
                <div key={idx} className={`${idx === 0 ? 'md:col-span-2' : ''} overflow-hidden bg-white/5 shadow-2xl`}>
                  {isVideo(img) ? <video src={img} autoPlay muted loop playsInline className="w-full h-auto" /> : <img src={img} className="w-full h-auto" alt="" />}
                </div>
              ))}
            </div>
          </section>
        );

      case 'process':
        return (
          <section key={block.id} className={`bg-[#0A0A0A] ${spacing} border-t border-white/5`}>
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-4xl font-serif text-center mb-24">Behind the Scenes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-16 items-start">
                {block.data.map((item: any, idx: number) => (
                  <div key={idx} className="space-y-4">
                    <div className="w-full bg-white/5 overflow-hidden shadow-2xl">
                      {isVideo(item.imageUrl) ? <video src={item.imageUrl} autoPlay muted loop playsInline className="w-full h-auto" /> : <img src={item.imageUrl} className="w-full h-auto" alt="" />}
                    </div>
                    <p className="text-[10px] tracking-[0.3em] uppercase font-bold text-white/40 font-sans">Step 0{idx + 1}: {item.label}</p>
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
    <div className="flex min-h-screen bg-[#0E0E0E]">
      {/* Side Bar - Navigation for easy switching */}
      <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 border-r border-white/5 bg-[#0E0E0E]/50 backdrop-blur-sm z-40 overflow-hidden pt-28">
        <div className="px-8 mb-10">
          <span className="text-[9px] tracking-[0.5em] text-white/20 uppercase font-bold">Archives</span>
          <div className="w-8 h-px bg-white/10 mt-2" />
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 custom-scrollbar space-y-4">
          {allProjects.map((p) => (
            <button
              key={p.id}
              onClick={() => onProjectSelect(p.slug)}
              className={`group flex flex-col items-start w-full transition-all duration-500 ${
                p.slug === project.slug ? 'opacity-100' : 'opacity-30 hover:opacity-100'
              }`}
            >
              <div className="relative w-full aspect-video overflow-hidden bg-white/5 mb-3">
                 {isVideo(p.thumbnailUrl) ? (
                   <video src={p.thumbnailUrl} className="w-full h-full object-cover" />
                 ) : (
                   <img src={p.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                 )}
                 {p.slug === project.slug && (
                    <div className="absolute inset-0 border-2 border-purple-500/50" />
                 )}
              </div>
              <p className={`text-[10px] tracking-widest uppercase font-bold truncate w-full text-left ${
                p.slug === project.slug ? 'text-purple-400' : 'text-white'
              }`}>
                {p.title}
              </p>
            </button>
          ))}
        </div>

        <div className="p-8 border-t border-white/5">
          <button 
            onClick={onBack}
            className="text-[9px] tracking-[0.4em] text-white/40 hover:text-white uppercase font-bold transition-colors flex items-center gap-3 group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            BACK TO WORKS
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-x-hidden animate-in fade-in duration-1000 pb-40">
        {/* 고정 메타데이터 헤더 */}
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-10 lg:pl-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-4xl">
              <span className="text-xs tracking-[0.5em] text-purple-400 uppercase mb-6 block font-bold font-sans">Project Details</span>
              <h1 className="text-5xl md:text-8xl font-serif mb-8 leading-tight tracking-tighter uppercase">{project.title}</h1>
              <p className="text-xl md:text-2xl text-white/50 font-light leading-relaxed italic max-w-3xl font-sans">"{project.shortDesc}"</p>
            </div>
            <button onClick={onBack} className="lg:hidden text-[10px] tracking-[0.4em] text-white/30 hover:text-white uppercase font-bold border-b border-white/10 pb-1 font-sans">Close Project</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-t border-b border-white/5 text-sm font-sans">
            <div>
              <p className="text-white/30 tracking-widest uppercase mb-2 text-[10px] font-bold">Duration</p>
              <p className="text-white font-medium">{project.duration}</p>
            </div>
            <div>
              <p className="text-white/30 tracking-widest uppercase mb-2 text-[10px] font-bold">Year</p>
              <p className="text-white font-medium">{project.year}</p>
            </div>
            <div>
              <p className="text-white/30 tracking-widest uppercase mb-2 text-[10px] font-bold">Main Role</p>
              <p className="text-white font-medium">{project.role}</p>
            </div>
            <div>
              <p className="text-white/30 tracking-widest uppercase mb-2 text-[10px] font-bold">Tools</p>
              <p className="text-purple-300 font-medium">{project.tools.join(', ')}</p>
            </div>
          </div>
        </section>

        {/* 블록 렌더링 */}
        <div className="flex flex-col lg:pl-12">
          {project.blocks.map(renderBlock)}
        </div>

        <div className="text-center py-40 border-t border-white/5 font-sans lg:pl-12">
           <button onClick={onBack} className="px-16 py-6 border border-white/10 text-[10px] tracking-[0.6em] font-bold uppercase hover:bg-white/5 transition-all">Back to Gallery</button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
