import React, { useState } from 'react';
import { Project, Profile, ContentBlock, BlockType } from '../types';

interface AdminProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  firebaseConfig: any;
  setFirebaseConfig: (config: any) => void;
}

const Admin: React.FC<AdminProps> = ({ projects, setProjects, profile, setProfile, firebaseConfig, setFirebaseConfig }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'profile' | 'database'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [fbInput, setFbInput] = useState(firebaseConfig ? JSON.stringify(firebaseConfig, null, 2) : '');

  const isVideo = (url: string) => url?.startsWith('data:video') || url?.endsWith('.mp4') || url?.endsWith('.webm');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleUpdateFirebase = () => {
    try {
      const parsed = JSON.parse(fbInput);
      setFirebaseConfig(parsed);
      alert('Firebase 설정이 저장되었습니다. 이제 모든 데이터가 클라우드 DB와 실시간으로 동기화됩니다.');
    } catch (e) {
      alert('JSON 형식이 올바르지 않습니다. Firebase 콘솔의 설정을 정확히 붙여넣어 주세요.');
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'heroImageUrl' | 'profileImageUrl' | 'resumeUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setProfile(prev => ({ ...prev, [field]: base64 }));
  };

  const addBlock = (type: BlockType) => {
    if (!editingProject) return;
    const newBlock: ContentBlock = {
      id: Date.now().toString(),
      type: type,
      data: type === 'concept' ? { background: '', visualStrategy: '', message: '', imageUrl: '' } :
            type === 'text' ? 'New text content here...' :
            type === 'process' ? [] :
            type === 'gallery' || type === 'storyboard' || type === 'grid-gallery' ? [] : 
            type === 'video' ? '<iframe src="" width="640" height="360" frameborder="0" allowfullscreen></iframe>' : '',
      settings: { 
        verticalSpacing: 'py-24',
        ...(type === 'text' && { fontSize: 'text-xl', fontFamily: 'font-sans', textAlign: 'text-left' }),
        ...(type === 'large-image' && { width: 'w-full' }),
        ...(type === 'grid-gallery' && { columns: 2 })
      }
    };
    setEditingProject({ ...editingProject, blocks: [...editingProject.blocks, newBlock] });
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (!editingProject) return;
    const newBlocks = [...editingProject.blocks];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newBlocks.length) return;
    [newBlocks[index], newBlocks[target]] = [newBlocks[target], newBlocks[index]];
    setEditingProject({ ...editingProject, blocks: newBlocks });
  };

  const deleteBlock = (id: string) => {
    if (!editingProject) return;
    setEditingProject({ ...editingProject, blocks: editingProject.blocks.filter(b => b.id !== id) });
  };

  const handleSaveProject = () => {
    if (!editingProject) return;
    let projectToSave = { ...editingProject };
    if (!projectToSave.slug.trim()) {
      projectToSave.slug = (projectToSave.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `project-${Date.now()}`;
    }
    const isDuplicateSlug = projects.some(p => p.slug === projectToSave.slug && p.id !== projectToSave.id);
    if (isDuplicateSlug) { projectToSave.slug = `${projectToSave.slug}-${Date.now()}`; }

    const newList = projects.find(p => p.id === projectToSave.id)
      ? projects.map(p => p.id === projectToSave.id ? projectToSave : p)
      : [...projects, projectToSave];
    
    setProjects(newList);
    setEditingProject(null);
    alert('프로젝트가 저장되었습니다. (DB 동기화 진행 중)');
  };

  const SpacingSelector = (block: ContentBlock, idx: number) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Vertical Spacing</label>
      <select className="bg-black border border-white/10 p-2 text-[10px] text-white outline-none" value={block.settings?.verticalSpacing || 'py-24'} 
        onChange={e => {
          if (!editingProject) return;
          const bs = [...editingProject.blocks];
          bs[idx].settings = { ...bs[idx].settings, verticalSpacing: e.target.value as any };
          setEditingProject({ ...editingProject, blocks: bs });
        }}>
        <option value="py-0">None (0)</option>
        <option value="py-12">Small (12)</option>
        <option value="py-24">Medium (24)</option>
        <option value="py-32">Large (32)</option>
        <option value="py-48">Extra Large (48)</option>
        <option value="py-64">Extreme (64)</option>
      </select>
    </div>
  );

  const renderArrayField = (label: string, items: any[], onAdd: () => void, onRemove: (idx: number) => void, renderItem: (item: any, idx: number) => React.ReactNode) => (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
        <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">{label}</label>
        <button onClick={onAdd} className="text-[10px] text-purple-400 font-bold uppercase hover:text-white">+ Add Item</button>
      </div>
      <div className="space-y-4">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-4 items-start group">
            <div className="flex-grow">{renderItem(item, idx)}</div>
            <button onClick={() => onRemove(idx)} className="text-[10px] text-white/20 hover:text-red-500 mt-2">✕</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-[10px] text-white/20 italic">No items added.</p>}
      </div>
    </div>
  );

  if (editingProject) {
    return (
      <div className="fixed inset-0 z-[110] bg-[#0E0E0E] overflow-y-auto pt-20 font-sans">
        <div className="sticky top-0 z-[120] bg-black/90 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-[10px] tracking-widest text-purple-400 font-bold uppercase">Project Builder</span>
            <span className="text-white/20">|</span>
            <h2 className="text-sm font-bold truncate max-w-[200px]">{editingProject.title || 'Untitled Project'}</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setEditingProject(null)} className="text-[10px] text-white/40 font-bold uppercase px-4 hover:text-white transition-colors">Close</button>
            <button onClick={handleSaveProject} className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-2 text-[10px] font-bold uppercase rounded-sm transition-all shadow-lg">Save Changes</button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-20">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 pb-20 border-b border-white/5">
             <div className="space-y-6">
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Project Title</label>
                  <input className="w-full bg-black border border-white/10 p-3 text-xl font-serif outline-none focus:border-purple-500" value={editingProject.title} onChange={e => setEditingProject({...editingProject, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Short Description</label>
                  <textarea className="w-full bg-black border border-white/10 p-3 text-sm italic outline-none focus:border-purple-500" rows={2} value={editingProject.shortDesc} onChange={e => setEditingProject({...editingProject, shortDesc: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Thumbnail Asset</label>
                  <div className="aspect-video bg-black relative group flex items-center justify-center border border-white/10">
                    {editingProject.thumbnailUrl ? (
                      isVideo(editingProject.thumbnailUrl) ? <video src={editingProject.thumbnailUrl} className="max-h-full" autoPlay muted loop /> : <img src={editingProject.thumbnailUrl} className="max-h-full" />
                    ) : <span className="text-[10px] text-white/20 uppercase tracking-widest">Empty</span>}
                    <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] font-bold transition-opacity">
                      UPLOAD IMAGE/VIDEO
                      <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                        const f = e.target.files?.[0]; if(!f) return;
                        const b64 = await fileToBase64(f);
                        setEditingProject({...editingProject, thumbnailUrl: b64});
                      }} />
                    </label>
                  </div>
                </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Duration</label>
                  <input className="w-full bg-black border border-white/10 p-2 text-xs" value={editingProject.duration} onChange={e => setEditingProject({...editingProject, duration: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Year</label>
                  <input className="w-full bg-black border border-white/10 p-2 text-xs" value={editingProject.year} onChange={e => setEditingProject({...editingProject, year: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Main Role</label>
                  <input className="w-full bg-black border border-white/10 p-2 text-xs" value={editingProject.role} onChange={e => setEditingProject({...editingProject, role: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">Tools (comma separated)</label>
                  <input className="w-full bg-black border border-white/10 p-2 text-xs" value={editingProject.tools.join(', ')} onChange={e => setEditingProject({...editingProject, tools: e.target.value.split(',').map(s => s.trim())})} />
                </div>
                <div className="col-span-2">
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">URL Slug</label>
                  <input className="w-full bg-black border border-white/10 p-2 text-xs" value={editingProject.slug} placeholder="e.g. project-one" onChange={e => setEditingProject({...editingProject, slug: e.target.value})} />
                </div>
             </div>
          </section>

          <div className="flex flex-wrap gap-2 p-4 bg-white/5 border border-white/10 mb-10 sticky top-16 z-10 backdrop-blur-md">
            <span className="text-[9px] text-white/40 uppercase font-bold w-full mb-2">Append Section:</span>
            {(['text', 'large-image', 'video', 'concept', 'grid-gallery', 'storyboard', 'gallery', 'process'] as BlockType[]).map(t => (
              <button key={t} onClick={() => addBlock(t)} className="px-4 py-2 bg-purple-900/20 border border-purple-500/30 text-[9px] font-bold uppercase hover:bg-purple-600 transition-colors">{t}</button>
            ))}
          </div>

          <div className="space-y-12">
            {editingProject.blocks.map((block, idx) => (
              <div key={block.id} className="group relative bg-[#1A1A1A] border border-white/10 p-8 rounded-sm">
                <div className="absolute -left-12 top-0 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveBlock(idx, 'up')} className="p-2 bg-white/10 rounded-full hover:bg-purple-600">↑</button>
                  <button onClick={() => moveBlock(idx, 'down')} className="p-2 bg-white/10 rounded-full hover:bg-purple-600">↓</button>
                  <button onClick={() => deleteBlock(block.id)} className="p-2 bg-red-900/50 rounded-full hover:bg-red-600 text-xs">✕</button>
                </div>
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-[0.3em]">{block.type} section</span>
                  {SpacingSelector(block, idx)}
                </div>

                {/* --- Text Block --- */}
                {block.type === 'text' && (
                  <div className="space-y-6">
                    <textarea className="w-full bg-black border border-white/10 p-4 text-white outline-none min-h-[150px] font-light" value={block.data} onChange={e => {
                      const bs = [...editingProject.blocks]; bs[idx].data = e.target.value; setEditingProject({...editingProject, blocks: bs});
                    }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.fontSize} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, fontSize: e.target.value as any}; setEditingProject({...editingProject, blocks: bs});
                       }}><option value="text-sm">Small</option><option value="text-base">Regular</option><option value="text-xl">Large</option><option value="text-3xl">Extra Large</option><option value="text-5xl">Display</option></select>
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.fontFamily} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, fontFamily: e.target.value as any}; setEditingProject({...editingProject, blocks: bs});
                       }}><option value="font-sans">Sans (Light)</option><option value="font-serif">Serif (Bold)</option></select>
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.textAlign || 'text-left'} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, textAlign: e.target.value as any}; setEditingProject({...editingProject, blocks: bs});
                       }}><option value="text-left">Align Left</option><option value="text-center">Align Center</option><option value="text-right">Align Right</option></select>
                    </div>
                  </div>
                )}

                {/* --- Large Image/Video Block --- */}
                {block.type === 'large-image' && (
                  <div className="aspect-video bg-black relative border border-white/10 group/img flex items-center justify-center">
                    {block.data ? (
                      isVideo(block.data) ? <video src={block.data} className="max-h-full" autoPlay muted loop /> : <img src={block.data} className="max-h-full" />
                    ) : <span className="text-[10px] text-white/20 uppercase tracking-widest">Upload Asset</span>}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer text-[10px] font-bold transition-opacity">
                      CHANGE ASSET
                      <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                        const f = e.target.files?.[0]; if(!f) return;
                        const b64 = await fileToBase64(f);
                        const bs = [...editingProject.blocks]; bs[idx].data = b64; setEditingProject({...editingProject, blocks: bs});
                      }} />
                    </label>
                  </div>
                )}

                {/* --- Video/Iframe Block --- */}
                {block.type === 'video' && (
                  <div className="space-y-4">
                    <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Vimeo / Youtube Iframe Embed Code</label>
                    <textarea className="w-full bg-black border border-white/10 p-4 text-xs font-mono text-purple-300 outline-none h-32" value={block.data} onChange={e => {
                      const bs = [...editingProject.blocks]; bs[idx].data = e.target.value; setEditingProject({...editingProject, blocks: bs});
                    }} placeholder='<iframe src="..." ...></iframe>' />
                  </div>
                )}

                {/* --- Concept Block --- */}
                {block.type === 'concept' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div><label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">01. Background</label><textarea className="w-full bg-black border border-white/10 p-2 text-xs text-white" value={block.data.background} onChange={e => { const bs = [...editingProject.blocks]; bs[idx].data = {...bs[idx].data, background: e.target.value}; setEditingProject({...editingProject, blocks: bs}); }} /></div>
                      <div><label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">02. Visual Strategy</label><textarea className="w-full bg-black border border-white/10 p-2 text-xs text-white" value={block.data.visualStrategy} onChange={e => { const bs = [...editingProject.blocks]; bs[idx].data = {...bs[idx].data, visualStrategy: e.target.value}; setEditingProject({...editingProject, blocks: bs}); }} /></div>
                      <div><label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">03. Message</label><textarea className="w-full bg-black border border-white/10 p-2 text-xs text-white" value={block.data.message} onChange={e => { const bs = [...editingProject.blocks]; bs[idx].data = {...bs[idx].data, message: e.target.value}; setEditingProject({...editingProject, blocks: bs}); }} /></div>
                    </div>
                    <div>
                      <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Key Visualization Asset</label>
                      <div className="aspect-[4/5] bg-black border border-white/10 relative group/cpt flex items-center justify-center">
                        {block.data.imageUrl ? (
                           isVideo(block.data.imageUrl) ? <video src={block.data.imageUrl} className="max-h-full" autoPlay muted loop /> : <img src={block.data.imageUrl} className="max-h-full" />
                        ) : <span className="text-[10px] text-white/20 uppercase">Empty</span>}
                        <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/cpt:opacity-100 flex items-center justify-center cursor-pointer text-[10px] font-bold transition-opacity">
                          CHANGE IMAGE/VIDEO
                          <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                            const f = e.target.files?.[0]; if(!f) return;
                            const b64 = await fileToBase64(f);
                            const bs = [...editingProject.blocks]; bs[idx].data = {...bs[idx].data, imageUrl: b64}; setEditingProject({...editingProject, blocks: bs});
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- Grid / Storyboard / Gallery Block --- */}
                {(block.type === 'grid-gallery' || block.type === 'storyboard' || block.type === 'gallery') && (
                  <div className="space-y-6">
                    {block.type === 'grid-gallery' && (
                      <div className="flex items-center gap-4 mb-4 border-b border-white/5 pb-4">
                        <label className="text-[9px] text-white/30 uppercase font-bold">Columns:</label>
                        <select className="bg-black border border-white/10 text-[10px] text-white p-1" value={block.settings?.columns || 2} onChange={e => {
                          const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, columns: parseInt(e.target.value)}; setEditingProject({...editingProject, blocks: bs});
                        }}>
                          {[2,3,4,5].map(v => <option key={v} value={v}>{v} Columns</option>)}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                      {block.data.map((item: string, assetIdx: number) => (
                        <div key={assetIdx} className="aspect-video bg-black border border-white/10 relative group/asset flex items-center justify-center">
                          {isVideo(item) ? <video src={item} className="max-h-full" muted /> : <img src={item} className="max-h-full" />}
                          <button 
                            onClick={() => {
                              const bs = [...editingProject.blocks]; 
                              bs[idx].data = bs[idx].data.filter((_: any, i: number) => i !== assetIdx);
                              setEditingProject({...editingProject, blocks: bs});
                            }}
                            className="absolute -top-2 -right-2 w-5 h-5 bg-red-600 text-white rounded-full text-[10px] opacity-0 group-hover/asset:opacity-100 transition-opacity"
                          >✕</button>
                        </div>
                      ))}
                      <label className="aspect-video border-2 border-dashed border-white/10 flex items-center justify-center cursor-pointer hover:border-purple-500 hover:text-purple-500 transition-all text-white/20">
                        <span className="text-xl">+</span>
                        <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                          const f = e.target.files?.[0]; if(!f) return;
                          const b64 = await fileToBase64(f);
                          const bs = [...editingProject.blocks]; 
                          bs[idx].data = [...bs[idx].data, b64]; 
                          setEditingProject({...editingProject, blocks: bs});
                        }} />
                      </label>
                    </div>
                  </div>
                )}

                {/* --- Process Block --- */}
                {block.type === 'process' && (
                  <div className="space-y-6">
                    <button onClick={() => {
                      const bs = [...editingProject.blocks]; bs[idx].data = [...bs[idx].data, {label: '', imageUrl: ''}]; setEditingProject({...editingProject, blocks: bs});
                    }} className="text-[10px] text-purple-400 font-bold uppercase mb-4">+ Add Step</button>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       {block.data.map((step: any, sIdx: number) => (
                         <div key={sIdx} className="bg-white/5 border border-white/10 p-4 space-y-4 group/step relative">
                           <button onClick={() => {
                             const bs = [...editingProject.blocks]; bs[idx].data = bs[idx].data.filter((_:any, i:number) => i !== sIdx); setEditingProject({...editingProject, blocks: bs});
                           }} className="absolute top-2 right-2 text-white/20 hover:text-red-500">✕</button>
                           <div className="aspect-video bg-black relative group/pimg flex items-center justify-center">
                             {step.imageUrl ? (
                               isVideo(step.imageUrl) ? <video src={step.imageUrl} className="max-h-full" /> : <img src={step.imageUrl} className="max-h-full" />
                             ) : <span className="text-[9px] text-white/10">No Image</span>}
                             <label className="absolute inset-0 bg-black/60 opacity-0 group-hover/pimg:opacity-100 flex items-center justify-center cursor-pointer text-[10px] font-bold">
                               UPLOAD
                               <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                                 const f = e.target.files?.[0]; if(!f) return;
                                 const b64 = await fileToBase64(f);
                                 const bs = [...editingProject.blocks]; bs[idx].data[sIdx].imageUrl = b64; setEditingProject({...editingProject, blocks: bs});
                               }} />
                             </label>
                           </div>
                           <input 
                             className="w-full bg-black border border-white/10 p-2 text-[10px] text-white" 
                             placeholder="Step Label (e.g. Wireframe)"
                             value={step.label}
                             onChange={e => {
                               const bs = [...editingProject.blocks]; bs[idx].data[sIdx].label = e.target.value; setEditingProject({...editingProject, blocks: bs});
                             }} 
                           />
                         </div>
                       ))}
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-20 animate-in fade-in duration-500 font-sans pb-40">
      <div className="flex items-center justify-between mb-20">
        <h1 className="text-3xl font-bold uppercase tracking-tighter">Admin Portal</h1>
        <div className="flex gap-2 bg-white/5 p-1 rounded-sm">
          <button onClick={() => setActiveTab('projects')} className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'projects' ? 'bg-purple-600' : ''}`}>Works</button>
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'profile' ? 'bg-purple-600' : ''}`}>Profile</button>
          <button onClick={() => setActiveTab('database')} className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'database' ? 'bg-purple-600' : ''}`}>Database</button>
        </div>
      </div>

      {activeTab === 'database' && (
        <section className="bg-[#1A1A1A] p-10 border border-purple-500/30 rounded-sm">
          <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-6 pb-2 border-b border-white/5">Firebase Firestore Connector</h2>
          <p className="text-[10px] text-white/40 mb-8 leading-relaxed">
            무료 데이터베이스(Firebase)를 연결하여 모든 방문자에게 실시간으로 업데이트된 내용을 보여줄 수 있습니다.<br/>
            Firebase 콘솔 &gt; 프로젝트 설정 &gt; <strong>firebaseConfig</strong> 객체 JSON을 아래에 붙여넣으세요.
          </p>
          <textarea 
            className="w-full bg-black border border-white/10 p-6 text-xs font-mono text-purple-300 outline-none h-64 focus:border-purple-500"
            value={fbInput}
            onChange={(e) => setFbInput(e.target.value)}
            placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
          />
          <div className="mt-8 flex justify-end">
            <button onClick={handleUpdateFirebase} className="bg-purple-600 text-white px-10 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl">Connect & Sync Database</button>
          </div>
        </section>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-10">
            <button onClick={() => setEditingProject({ id: Date.now().toString(), title: '', slug: '', category: 'Surreal', shortDesc: '', duration: '', role: '', tools: [], year: '2025', thumbnailUrl: '', blocks: [] })} className="bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all">Create New Project</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((p, index) => (
              <div key={p.id} className="bg-[#1A1A1A] p-6 flex justify-between items-center border border-white/10 group hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-6">
                   <h3 className="text-xl font-bold font-serif">{p.title || 'Untitled'}</h3>
                </div>
                <div className="flex gap-6">
                  <button onClick={() => setEditingProject(p)} className="text-[10px] font-bold uppercase text-purple-400 hover:text-purple-300">Edit</button>
                  <button onClick={() => { if(confirm('Delete Project?')) setProjects(prev => prev.filter(x => x.id !== p.id)); }} className="text-[10px] font-bold uppercase text-red-500/50 hover:text-red-500">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'profile' && (
        <div className="space-y-12 animate-in fade-in duration-700">
          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Personal Identity & Media</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
               <div className="space-y-8">
                  <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Hero Image (Background)</label>
                    <div className="aspect-video bg-black border border-white/10 relative overflow-hidden group">
                      {profile.heroImageUrl ? <img src={profile.heroImageUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-white/20 text-[10px]">Empty</div>}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[10px] font-bold transition-opacity">
                        CHANGE HERO
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'heroImageUrl')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Profile Image</label>
                    <div className="aspect-[4/5] w-48 bg-black border border-white/10 relative overflow-hidden group">
                      {profile.profileImageUrl ? <img src={profile.profileImageUrl} className="w-full h-full object-cover" /> : <div className="flex items-center justify-center h-full text-white/20 text-[10px]">Empty</div>}
                      <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer text-[10px] font-bold transition-opacity">
                        CHANGE PHOTO
                        <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'profileImageUrl')} />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Resume PDF (Base64)</label>
                    <input type="file" accept="application/pdf" className="text-[10px] text-white/40 block w-full" onChange={e => handleProfileImageUpload(e, 'resumeUrl')} />
                    <p className="text-[9px] text-purple-400/50 mt-1 italic">Current: {profile.resumeUrl ? 'Uploaded' : 'None'}</p>
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Real Name</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Artist Name</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.alias} onChange={e => setProfile({...profile, alias: e.target.value})} /></div>
                 </div>
                 
                 <div className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex items-center gap-2">
                     <input type="checkbox" id="showHomeTitle" checked={profile.showHomeTitle} onChange={e => setProfile({...profile, showHomeTitle: e.target.checked})} />
                     <label htmlFor="showHomeTitle" className="text-[9px] text-white/30 uppercase font-bold">Show Hero Text Overlay</label>
                   </div>
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Hero Title (e.g. HAEMONGA)</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.homeTitle || ''} onChange={e => setProfile({...profile, homeTitle: e.target.value})} /></div>
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Hero Subtitle (e.g. Jeon Haemi)</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.homeSubtitle || ''} onChange={e => setProfile({...profile, homeSubtitle: e.target.value})} /></div>
                 </div>

                 <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Job Title / Role</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} /></div>
                 <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Email</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} /></div>
                 <div className="grid grid-cols-2 gap-4">
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Behance URL</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.behance} onChange={e => setProfile({...profile, behance: e.target.value})} /></div>
                   <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Notefolio URL</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.notefolio} onChange={e => setProfile({...profile, notefolio: e.target.value})} /></div>
                 </div>
               </div>
            </div>

            <div className="mb-12">
               <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Biography</label>
               <textarea className="w-full bg-black border border-white/10 p-4 text-white outline-none h-48 leading-relaxed font-light" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
            </div>

            <div className="border-t border-white/5 pt-12">
              <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8">Professional Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {renderArrayField('Education History', profile.education || [], 
                  () => setProfile({...profile, education: [...(profile.education || []), {period: '', school: '', major: ''}]}),
                  (idx) => setProfile({...profile, education: profile.education.filter((_, i) => i !== idx)}),
                  (item, idx) => (
                    <div className="space-y-2 bg-white/5 p-4 rounded-sm">
                      <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Period" value={item.period} onChange={e => {
                        const next = [...profile.education]; next[idx].period = e.target.value; setProfile({...profile, education: next});
                      }} />
                      <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="School Name" value={item.school} onChange={e => {
                        const next = [...profile.education]; next[idx].school = e.target.value; setProfile({...profile, education: next});
                      }} />
                      <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Major" value={item.major} onChange={e => {
                        const next = [...profile.education]; next[idx].major = e.target.value; setProfile({...profile, education: next});
                      }} />
                    </div>
                  )
                )}

                {renderArrayField('Experience & Awards', profile.experience || [], 
                  () => setProfile({...profile, experience: [...(profile.experience || []), {year: '', title: ''}]}),
                  (idx) => setProfile({...profile, experience: profile.experience.filter((_, i) => i !== idx)}),
                  (item, idx) => (
                    <div className="space-y-2 bg-white/5 p-4 rounded-sm">
                      <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Year" value={item.year} onChange={e => {
                        const next = [...profile.experience]; next[idx].year = e.target.value; setProfile({...profile, experience: next});
                      }} />
                      <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Title" value={item.title} onChange={e => {
                        const next = [...profile.experience]; next[idx].title = e.target.value; setProfile({...profile, experience: next});
                      }} />
                    </div>
                  )
                )}

                {renderArrayField('Skills: 3D', profile.skills.threeD || [], 
                  () => setProfile({...profile, skills: {...profile.skills, threeD: [...profile.skills.threeD, '']}}),
                  (idx) => setProfile({...profile, skills: {...profile.skills, threeD: profile.skills.threeD.filter((_, i) => i !== idx)}}),
                  (item, idx) => (
                    <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Skill" value={item} onChange={e => {
                      const next = [...profile.skills.threeD]; next[idx] = e.target.value; setProfile({...profile, skills: {...profile.skills, threeD: next}});
                    }} />
                  )
                )}

                {renderArrayField('Skills: 2D', profile.skills.twoD || [], 
                  () => setProfile({...profile, skills: {...profile.skills, twoD: [...profile.skills.twoD, '']}}),
                  (idx) => setProfile({...profile, skills: {...profile.skills, twoD: profile.skills.twoD.filter((_, i) => i !== idx)}}),
                  (item, idx) => (
                    <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Skill" value={item} onChange={e => {
                      const next = [...profile.skills.twoD]; next[idx] = e.target.value; setProfile({...profile, skills: {...profile.skills, twoD: next}});
                    }} />
                  )
                )}

                {renderArrayField('Key Strengths', profile.strengths || [], 
                  () => setProfile({...profile, strengths: [...(profile.strengths || []), '']}),
                  (idx) => setProfile({...profile, strengths: profile.strengths.filter((_, i) => i !== idx)}),
                  (item, idx) => (
                    <input className="w-full bg-transparent border-b border-white/10 p-1 text-[10px]" placeholder="Strength" value={item} onChange={e => {
                      const next = [...profile.strengths]; next[idx] = e.target.value; setProfile({...profile, strengths: next});
                    }} />
                  )
                )}
              </div>
            </div>

            <div className="mt-12 flex justify-center border-t border-white/5 pt-10">
              <button onClick={() => alert('프로필 변경사항이 저장되었습니다.')} className="bg-purple-600 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl">Save Complete Profile</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Admin;
