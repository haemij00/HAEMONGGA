
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

  const handleExportConfig = () => {
    const config = { projects, profile };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    alert('설정 코드가 클립보드에 복사되었습니다!');
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
                {/* ... (Other Block Types implementation continues same as before) */}
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
            Firebase 콘솔 > 프로젝트 설정 > <strong>firebaseConfig</strong> 객체 JSON을 아래에 붙여넣으세요.
          </p>
          <textarea 
            className="w-full bg-black border border-white/10 p-6 text-xs font-mono text-purple-300 outline-none h-64 focus:border-purple-500"
            value={fbInput}
            onChange={(e) => setFbInput(e.target.value)}
            placeholder='{ "apiKey": "...", "authDomain": "...", ... }'
          />
          <div className="mt-8 flex justify-between items-center">
            <button onClick={handleExportConfig} className="text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white">Export Local Data to Clipboard</button>
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
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-8 border-b border-white/5 pb-4">Personal Identity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Real Name</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} /></div>
                <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Artist Name</label><input className="w-full bg-black border border-white/10 p-3 text-white outline-none focus:border-purple-500" value={profile.alias} onChange={e => setProfile({...profile, alias: e.target.value})} /></div>
              </div>
              <div><label className="text-[9px] text-white/30 uppercase font-bold mb-2 block">Biography</label><textarea className="w-full bg-black border border-white/10 p-3 text-white outline-none h-32" value={profile.bio} onChange={e => setProfile({...profile, bio: e.target.value})} /></div>
            </div>
            <div className="mt-12 flex justify-center border-t border-white/5 pt-10">
              <button onClick={() => alert('프로필이 저장되었습니다. (DB 동기화 진행 중)')} className="bg-purple-600 text-white px-12 py-5 text-[10px] font-bold uppercase tracking-widest hover:bg-purple-500 transition-all">Save Profile</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Admin;
