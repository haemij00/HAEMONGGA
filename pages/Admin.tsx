
import React, { useState } from 'react';
import { Project, Profile, ContentBlock, BlockType } from '../types';

interface AdminProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

const Admin: React.FC<AdminProps> = ({ projects, setProjects, profile, setProfile }) => {
  const [activeTab, setActiveTab] = useState<'projects' | 'profile'>('projects');
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const isVideo = (url: string) => url?.startsWith('data:video') || url?.endsWith('.mp4') || url?.endsWith('.webm');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleExportConfig = () => {
    const config = {
      projects,
      profile
    };
    const configStr = JSON.stringify(config, null, 2);
    navigator.clipboard.writeText(configStr);
    alert('설정 코드가 클립보드에 복사되었습니다! 이 코드를 AI 개발자에게 전달하여 "이 설정으로 constants.tsx를 업데이트해줘"라고 요청하면 모든 방문자에게 수정 사항이 반영됩니다.');
  };

  const handleImportConfig = () => {
    const code = prompt('복사해두었던 설정 코드를 여기에 붙여넣으세요:');
    if (!code) return;
    try {
      const parsed = JSON.parse(code);
      if (parsed.projects) setProjects(parsed.projects);
      if (parsed.profile) setProfile(parsed.profile);
      alert('데이터를 성공적으로 불러왔습니다.');
    } catch (e) {
      alert('올바르지 않은 코드 형식입니다.');
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
    
    // Auto-generate slug if empty
    let projectToSave = { ...editingProject };
    if (!projectToSave.slug.trim()) {
      projectToSave.slug = (projectToSave.title || 'untitled')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `project-${Date.now()}`;
    }

    // Check for slug collisions
    const isDuplicateSlug = projects.some(p => p.slug === projectToSave.slug && p.id !== projectToSave.id);
    if (isDuplicateSlug) {
      projectToSave.slug = `${projectToSave.slug}-${Date.now()}`;
    }

    const newList = projects.find(p => p.id === projectToSave.id)
      ? projects.map(p => p.id === projectToSave.id ? projectToSave : p)
      : [...projects, projectToSave];
    
    setProjects(newList);
    setEditingProject(null);
    alert('저장되었습니다.');
  };

  const SpacingSelector = (block: ContentBlock, idx: number) => (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Vertical Spacing</label>
      <select 
        className="bg-black border border-white/10 p-2 text-[10px] text-white outline-none" 
        value={block.settings?.verticalSpacing || 'py-24'} 
        onChange={e => {
          if (!editingProject) return;
          const bs = [...editingProject.blocks];
          bs[idx].settings = { ...bs[idx].settings, verticalSpacing: e.target.value as any };
          setEditingProject({ ...editingProject, blocks: bs });
        }}
      >
        <option value="py-0">None (0)</option>
        <option value="py-12">Small (12)</option>
        <option value="py-24">Medium (24)</option>
        <option value="py-32">Large (32)</option>
        <option value="py-48">Extra Large (48)</option>
        <option value="py-64">Extreme (64)</option>
      </select>
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
                  <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest mb-2 block">URL Slug (Will auto-generate if empty)</label>
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

                {block.type === 'text' && (
                  <div className="space-y-6">
                    <textarea className="w-full bg-black border border-white/10 p-4 text-white outline-none min-h-[150px] font-light" value={block.data} onChange={e => {
                      const bs = [...editingProject.blocks]; bs[idx].data = e.target.value;
                      setEditingProject({...editingProject, blocks: bs});
                    }} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.fontSize} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, fontSize: e.target.value as any};
                         setEditingProject({...editingProject, blocks: bs});
                       }}>
                         <option value="text-sm">Small</option>
                         <option value="text-base">Regular</option>
                         <option value="text-xl">Large</option>
                         <option value="text-3xl">Extra Large</option>
                         <option value="text-5xl">Display</option>
                       </select>
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.fontFamily} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, fontFamily: e.target.value as any};
                         setEditingProject({...editingProject, blocks: bs});
                       }}>
                         <option value="font-sans">Sans (Light)</option>
                         <option value="font-serif">Serif (Bold)</option>
                       </select>
                       <select className="bg-black border border-white/10 p-2 text-xs" value={block.settings?.textAlign || 'text-left'} onChange={e => {
                         const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, textAlign: e.target.value as any};
                         setEditingProject({...editingProject, blocks: bs});
                       }}>
                         <option value="text-left">Align Left</option>
                         <option value="text-center">Align Center</option>
                         <option value="text-right">Align Right</option>
                       </select>
                    </div>
                  </div>
                )}

                {block.type === 'large-image' && (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black relative group/file flex items-center justify-center border border-white/10">
                      {block.data ? (
                        isVideo(block.data) ? <video src={block.data} className="max-h-full" autoPlay muted loop /> : <img src={block.data} className="max-h-full" />
                      ) : <span className="text-[10px] text-white/20 uppercase tracking-widest">Asset Missing</span>}
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/file:opacity-100 cursor-pointer text-[10px] font-bold transition-opacity">
                        UPLOAD ASSET
                        <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                          const f = e.target.files?.[0]; if(!f) return;
                          const b64 = await fileToBase64(f);
                          const bs = [...editingProject.blocks]; bs[idx].data = b64;
                          setEditingProject({...editingProject, blocks: bs});
                        }} />
                      </label>
                    </div>
                    <select className="bg-black border border-white/10 p-2 text-xs w-full" value={block.settings?.width} onChange={e => {
                      const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, width: e.target.value as any};
                      setEditingProject({...editingProject, blocks: bs});
                    }}>
                      <option value="w-1/2">50% Width</option>
                      <option value="w-3/4">75% Width</option>
                      <option value="w-full">100% Width</option>
                    </select>
                  </div>
                )}

                {block.type === 'video' && (
                  <div>
                    <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Embed Iframe (YouTube/Vimeo)</label>
                    <textarea className="w-full bg-black border border-white/10 p-3 text-xs font-mono outline-none h-24" value={block.data} onChange={e => {
                       const bs = [...editingProject.blocks]; bs[idx].data = e.target.value;
                       setEditingProject({...editingProject, blocks: bs});
                    }} />
                  </div>
                )}

                {block.type === 'concept' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      {['background', 'visualStrategy', 'message'].map((f) => (
                        <div key={f}>
                          <label className="text-[9px] text-white/30 uppercase font-bold mb-1 block">{f}</label>
                          <textarea className="w-full bg-black border border-white/10 p-2 text-xs h-20" value={block.data[f]} onChange={e => {
                            const bs = [...editingProject.blocks]; bs[idx].data[f] = e.target.value;
                            setEditingProject({...editingProject, blocks: bs});
                          }} />
                        </div>
                      ))}
                    </div>
                    <div className="aspect-[4/5] bg-black relative group/file flex items-center justify-center border border-white/10">
                      {block.data.imageUrl ? (
                        isVideo(block.data.imageUrl) ? <video src={block.data.imageUrl} className="max-h-full" autoPlay muted loop /> : <img src={block.data.imageUrl} className="max-h-full" />
                      ) : <span className="text-[10px] text-white/20 uppercase tracking-widest">Key Visual</span>}
                      <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/file:opacity-100 cursor-pointer text-[10px] font-bold transition-opacity">
                        CHANGE VISUAL
                        <input type="file" className="hidden" accept="image/*, video/*" onChange={async e => {
                          const f = e.target.files?.[0]; if(!f) return;
                          const b64 = await fileToBase64(f);
                          const bs = [...editingProject.blocks]; bs[idx].data.imageUrl = b64;
                          setEditingProject({...editingProject, blocks: bs});
                        }} />
                      </label>
                    </div>
                  </div>
                )}

                {(block.type === 'grid-gallery' || block.type === 'storyboard' || block.type === 'gallery') && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] text-white/30 uppercase font-bold">Items ({block.data.length})</label>
                      <div className="flex gap-4">
                        {block.type === 'grid-gallery' && (
                          <select className="bg-black border border-white/10 p-2 text-[9px] text-white outline-none uppercase font-bold" value={block.settings?.columns} onChange={e => {
                            const bs = [...editingProject.blocks]; bs[idx].settings = {...bs[idx].settings, columns: parseInt(e.target.value)};
                            setEditingProject({...editingProject, blocks: bs});
                          }}>
                            <option value={2}>2 Columns</option>
                            <option value={3}>3 Columns</option>
                            <option value={4}>4 Columns</option>
                            <option value={5}>5 Columns (2+3 Layout)</option>
                          </select>
                        )}
                        <label className="bg-white/10 hover:bg-white/20 px-4 py-2 text-[9px] font-bold uppercase tracking-widest cursor-pointer transition-colors">
                          Add Media
                          <input type="file" className="hidden" accept="image/*, video/*" multiple onChange={async e => {
                             const files = Array.from(e.target.files || []);
                             const bases = await Promise.all(files.map(f => fileToBase64(f)));
                             const bs = [...editingProject.blocks];
                             bs[idx].data = [...bs[idx].data, ...bases];
                             setEditingProject({...editingProject, blocks: bs});
                          }} />
                        </label>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {block.data.map((url: string, midx: number) => (
                        <div key={midx} className="aspect-square bg-black relative group/media border border-white/5">
                           {isVideo(url) ? <video src={url} className="w-full h-full object-cover" /> : <img src={url} className="w-full h-full object-cover" />}
                           <button onClick={() => {
                             const bs = [...editingProject.blocks]; bs[idx].data.splice(midx, 1);
                             setEditingProject({...editingProject, blocks: bs});
                           }} className="absolute top-2 right-2 p-1 bg-red-600 rounded-full opacity-0 group-hover/media:opacity-100 transition-opacity text-[8px] z-10">✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {block.type === 'process' && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                       <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest">Process Milestones</label>
                       <button onClick={() => {
                         const bs = [...editingProject.blocks]; bs[idx].data.push({ label: '', imageUrl: '' });
                         setEditingProject({...editingProject, blocks: bs});
                       }} className="bg-purple-900/40 text-[9px] font-bold px-4 py-2 border border-purple-500/30">+ NEW STEP</button>
                    </div>
                    {block.data.map((item: any, pidx: number) => (
                      <div key={pidx} className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-black/40 p-4 border border-white/5">
                         <div className="aspect-video bg-black relative group/process flex items-center justify-center border border-white/10">
                            {item.imageUrl ? (isVideo(item.imageUrl) ? <video src={item.imageUrl} className="max-h-full" /> : <img src={item.imageUrl} className="max-h-full" />) : <span className="text-[10px] text-white/10">Asset</span>}
                            <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/process:opacity-100 cursor-pointer text-[8px] font-bold transition-opacity">
                              UPLOAD
                              <input type="file" className="hidden" onChange={async e => {
                                 const f = e.target.files?.[0]; if(!f) return;
                                 const b64 = await fileToBase64(f);
                                 const bs = [...editingProject.blocks]; bs[idx].data[pidx].imageUrl = b64;
                                 setEditingProject({...editingProject, blocks: bs});
                              }} />
                            </label>
                         </div>
                         <div className="md:col-span-2 flex flex-col justify-between">
                            <input className="w-full bg-black border border-white/10 p-2 text-xs" value={item.label} placeholder="e.g. Character Sculpting" onChange={e => {
                               const bs = [...editingProject.blocks]; bs[idx].data[pidx].label = e.target.value;
                               setEditingProject({...editingProject, blocks: bs});
                            }} />
                            <button onClick={() => {
                               const bs = [...editingProject.blocks]; bs[idx].data.splice(pidx, 1);
                               setEditingProject({...editingProject, blocks: bs});
                            }} className="self-end text-red-500/50 hover:text-red-500 text-[10px] font-bold uppercase mt-2">Delete Milestone</button>
                         </div>
                      </div>
                    ))}
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
          <button onClick={() => setActiveTab('profile')} className={`px-6 py-2 text-[10px] font-bold tracking-widest uppercase transition-all ${activeTab === 'profile' ? 'bg-purple-600' : ''}`}>Profile & Bio</button>
        </div>
      </div>

      {/* Global Sync Notice */}
      <section className="bg-purple-900/10 border border-purple-500/30 p-8 rounded-sm mb-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex-1">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-purple-400 mb-2">Publishing & Global Sync</h2>
          <p className="text-[10px] text-white/50 leading-relaxed max-w-lg">
            현재 수정 사항은 이 브라우저에만 저장되어 있습니다. 다른 기기나 방문자에게도 반영하려면 아래 버튼을 눌러 설정 코드를 복사한 뒤, 개발자(AI)에게 전달하여 <strong>constants.tsx를 업데이트해달라고</strong> 요청하세요.
          </p>
        </div>
        <div className="flex gap-4">
          <button onClick={handleImportConfig} className="px-6 py-3 border border-white/20 text-[10px] font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">Import Code</button>
          <button onClick={handleExportConfig} className="px-6 py-3 bg-purple-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-lg">Copy Publish Code</button>
        </div>
      </section>

      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-end mb-10">
            <button onClick={() => setEditingProject({ id: Date.now().toString(), title: '', slug: '', category: 'Surreal', shortDesc: '', duration: '', role: '', tools: [], year: '2025', thumbnailUrl: '', blocks: [] })} className="bg-white text-black px-8 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all">Create New Project</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((p, index) => (
              <div key={p.id} className="bg-[#1A1A1A] p-6 flex justify-between items-center border border-white/10 group hover:border-purple-500/50 transition-all">
                <div className="flex items-center gap-6">
                   <div className="flex flex-col gap-1 mr-4 border-r border-white/5 pr-4">
                     <button disabled={index === 0} onClick={() => {
                       const newP = [...projects]; [newP[index], newP[index-1]] = [newP[index-1], newP[index]]; setProjects(newP);
                     }} className="p-1 hover:text-purple-400 disabled:opacity-20 transition-colors">↑</button>
                     <button disabled={index === projects.length - 1} onClick={() => {
                       const newP = [...projects]; [newP[index], newP[index+1]] = [newP[index+1], newP[index]]; setProjects(newP);
                     }} className="p-1 hover:text-purple-400 disabled:opacity-20 transition-colors">↓</button>
                   </div>
                   <div className="w-20 aspect-video bg-black overflow-hidden border border-white/5">
                     {isVideo(p.thumbnailUrl) ? <video src={p.thumbnailUrl} className="w-full h-full object-cover opacity-50" /> : <img src={p.thumbnailUrl} className="w-full h-full object-cover opacity-50" />}
                   </div>
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
          {/* Home Page Info Settings Section */}
          <section className="bg-[#1A1A1A] p-10 border border-purple-500/30 rounded-sm shadow-[0_0_30px_rgba(147,51,234,0.05)]">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Home Page Content (Separate from Profile)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block tracking-widest">Home Alias Title (e.g. HAEMONGA)</label>
                  <input 
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500 font-bold uppercase tracking-[0.2em] font-sans text-sm" 
                    value={profile.homeTitle || ''} 
                    placeholder="HAEMONGA"
                    onChange={e => setProfile({...profile, homeTitle: e.target.value})} 
                  />
                  <p className="text-[9px] text-white/20 mt-2 italic font-sans">Landing page main title. Independent from general profile alias.</p>
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block tracking-widest">Home Name/Subtitle (e.g. Jeon Haemi)</label>
                  <input 
                    className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500 font-medium font-sans text-sm" 
                    value={profile.homeSubtitle || ''} 
                    placeholder="Jeon Haemi"
                    onChange={e => setProfile({...profile, homeSubtitle: e.target.value})} 
                  />
                  <p className="text-[9px] text-white/20 mt-2 italic font-sans">Landing page subtitle. Keep in English for style as requested.</p>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <label className="text-[9px] text-white/30 uppercase font-bold tracking-widest block">Home Title Toggle</label>
                <button 
                  onClick={() => setProfile({...profile, showHomeTitle: !profile.showHomeTitle})}
                  className={`w-full py-3 text-[10px] font-bold uppercase tracking-widest rounded-sm border transition-all ${
                    profile.showHomeTitle !== false 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg' 
                    : 'bg-white/5 border-white/10 text-white/30'
                  }`}
                >
                  {profile.showHomeTitle !== false ? 'TITLE IS VISIBLE' : 'TITLE IS HIDDEN'}
                </button>
              </div>
            </div>
          </section>

          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Personal Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Real Name</label>
                  <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Artist Name (Alias)</label>
                  <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.alias} onChange={e => setProfile({...profile, alias: e.target.value})} />
                </div>
                <div>
                  <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Professional Role</label>
                  <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.role} onChange={e => setProfile({...profile, role: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Biography</label>
                <textarea className="w-full bg-black border border-white/10 p-3 text-white outline-none h-[216px]" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} />
              </div>
            </div>
          </section>

          {/* Strength Management Section */}
          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Core Strengths</h2>
            <div className="space-y-4">
              {profile.strengths?.map((str, idx) => (
                <div key={idx} className="flex gap-4">
                  <input 
                    className="flex-grow bg-black border border-white/10 p-3 text-white text-xs outline-none focus:border-purple-500" 
                    value={str} 
                    placeholder={`Strength point #${idx + 1}`}
                    onChange={e => {
                      const newList = [...profile.strengths];
                      newList[idx] = e.target.value;
                      setProfile({ ...profile, strengths: newList });
                    }} 
                  />
                  <button 
                    onClick={() => {
                      const newList = [...profile.strengths];
                      newList.splice(idx, 1);
                      setProfile({ ...profile, strengths: newList });
                    }} 
                    className="text-red-500/50 hover:text-red-500 font-bold uppercase text-[9px] tracking-widest px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setProfile({ ...profile, strengths: [...(profile.strengths || []), ''] })} 
                className="text-[9px] font-bold text-purple-400 uppercase tracking-[0.3em] mt-4 hover:text-white transition-colors"
              >
                + ADD STRENGTH POINT
              </button>
              {(!profile.strengths || profile.strengths.length === 0) && (
                <p className="text-[10px] text-white/20 italic font-sans mt-2 tracking-widest">Section is currently hidden (No data)</p>
              )}
            </div>
          </section>

          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Contact Channels</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Contact Email</label>
                <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500 text-xs" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Behance URL</label>
                <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500 text-xs" value={profile.behance} onChange={e => setProfile({...profile, behance: e.target.value})} />
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Notefolio URL</label>
                <input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500 text-xs" value={profile.notefolio} onChange={e => setProfile({...profile, notefolio: e.target.value})} />
              </div>
            </div>
          </section>

          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Expertise (Comma separated)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">3D & Simulation Stack</label>
                <textarea className="w-full bg-black border border-white/10 p-3 text-white outline-none text-xs" value={profile.skills.threeD.join(', ')} onChange={e => setProfile({...profile, skills: {...profile.skills, threeD: e.target.value.split(',').map(s => s.trim())}})} />
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">2D & Post Stack</label>
                <textarea className="w-full bg-black border border-white/10 p-3 text-white outline-none text-xs" value={profile.skills.twoD.join(', ')} onChange={e => setProfile({...profile, skills: {...profile.skills, twoD: e.target.value.split(',').map(s => s.trim())}})} />
              </div>
            </div>
          </section>

          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Timeline (Experience & Education)</h2>
            <div className="space-y-10">
              <div>
                <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-4">Milestones & Exhibitions</h3>
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="flex gap-4 mb-3">
                    <input className="w-20 bg-black border border-white/10 p-2 text-xs" value={exp.year} placeholder="Year" onChange={e => {
                      const exps = [...profile.experience]; exps[idx].year = e.target.value; setProfile({...profile, experience: exps});
                    }} />
                    <input className="flex-grow bg-black border border-white/10 p-2 text-xs" value={exp.title} placeholder="Title" onChange={e => {
                      const exps = [...profile.experience]; exps[idx].title = e.target.value; setProfile({...profile, experience: exps});
                    }} />
                    <button onClick={() => {
                      const exps = [...profile.experience]; exps.splice(idx, 1); setProfile({...profile, experience: exps});
                    }} className="text-red-500/50 hover:text-red-500 px-2 font-bold uppercase text-[9px]">Remove</button>
                  </div>
                ))}
                <button onClick={() => setProfile({...profile, experience: [...profile.experience, {year: '', title: ''}]})} className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-2 hover:text-white transition-colors">+ Add Milestone</button>
              </div>

              <div>
                <h3 className="text-[10px] text-white/30 uppercase font-bold tracking-widest mb-4">Education</h3>
                {profile.education?.map((edu, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3 bg-black/20 p-4 border border-white/5">
                    <input className="bg-black border border-white/10 p-2 text-xs" value={edu.period} placeholder="Period" onChange={e => {
                      const edus = [...profile.education]; edus[idx].period = e.target.value; setProfile({...profile, education: edus});
                    }} />
                    <input className="bg-black border border-white/10 p-2 text-xs" value={edu.school} placeholder="Institution" onChange={e => {
                      const edus = [...profile.education]; edus[idx].school = e.target.value; setProfile({...profile, education: edus});
                    }} />
                    <div className="flex gap-2">
                      <input className="flex-grow bg-black border border-white/10 p-2 text-xs" value={edu.major} placeholder="Major" onChange={e => {
                        const edus = [...profile.education]; edus[idx].major = e.target.value; setProfile({...profile, education: edus});
                      }} />
                      <button onClick={() => {
                        const edus = [...profile.education]; edus.splice(idx, 1); setProfile({...profile, education: edus});
                      }} className="text-red-500/50 hover:text-red-500 px-2 font-bold uppercase text-[9px]">Remove</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setProfile({...profile, education: [...profile.education, {period: '', school: '', major: ''}]})} className="text-[9px] font-bold text-purple-400 uppercase tracking-widest mt-2 hover:text-white transition-colors">+ Add Education</button>
              </div>
            </div>
          </section>

          <section className="bg-[#1A1A1A] p-10 border border-white/10 rounded-sm">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Imagery & Documents</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-4 block">Hero Backdrop (Landing)</label>
                <div className="aspect-video bg-black relative group overflow-hidden border border-white/10">
                  <img src={profile.heroImageUrl} className="w-full h-full object-cover opacity-60" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] font-bold transition-opacity">
                    REPLACE HERO
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'heroImageUrl')} />
                  </label>
                </div>
              </div>
              <div>
                <label className="text-[9px] text-white/30 uppercase font-bold mb-4 block">Artist Profile Picture</label>
                <div className="aspect-[4/5] max-w-[240px] bg-black relative group overflow-hidden border border-white/10 mx-auto">
                  <img src={profile.profileImageUrl} className="w-full h-full object-cover opacity-60" />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer text-[10px] font-bold transition-opacity">
                    REPLACE PHOTO
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleProfileImageUpload(e, 'profileImageUrl')} />
                  </label>
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/5">
              <label className="text-[9px] text-white/30 uppercase font-bold mb-4 block">Professional CV (PDF)</label>
              <div className="flex items-center gap-6">
                <div className="flex-grow p-4 bg-black/40 border border-dashed border-white/10 rounded-sm text-xs text-white/20 uppercase tracking-widest">
                  {profile.resumeUrl ? '✓ PDF Linked' : 'No document attached'}
                </div>
                <label className="bg-white text-black px-6 py-4 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all cursor-pointer">
                  UPLOAD PDF
                  <input type="file" className="hidden" accept="application/pdf" onChange={e => handleProfileImageUpload(e, 'resumeUrl')} />
                </label>
              </div>
            </div>
          </section>

          <div className="flex justify-center pb-20">
             <button onClick={() => alert('Profile update complete. (Project data persistence will also sync profile data)')} className="bg-purple-600 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all shadow-xl">Apply Profile Changes</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
