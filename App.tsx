
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import { Project, Profile } from './types';
import { INITIAL_PROJECTS, INITIAL_PROFILE, DEFAULT_FIREBASE_CONFIG } from './constants';

// Page Imports
import Home from './pages/Home';
import About from './pages/About';
import Works from './pages/Works';
import Contact from './pages/Contact';
import ProjectDetail from './pages/ProjectDetail';
import Admin from './pages/Admin';

// Firebase Imports
import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

const DB_NAME = 'HaemonggaDB';
const STORE_NAME = 'PortfolioStore';

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getDBItem = async (key: string): Promise<any> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const setDBItem = async (key: string, value: any): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

const App: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [activeView, setActiveView] = useState<'main' | 'project-detail' | 'admin'>('main');
  const [selectedProjectSlug, setSelectedProjectSlug] = useState<string | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [firebaseConfig, setFirebaseConfig] = useState<any>(DEFAULT_FIREBASE_CONFIG);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    works: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  // Sync Logic
  const syncWithFirebase = async (config: any) => {
    if (!config || !config.apiKey) return;
    try {
      const app = !getApps().length ? initializeApp(config) : getApp();
      const db = getFirestore(app);
      
      const profileDoc = await getDoc(doc(db, "portfolio", "profile"));
      if (profileDoc.exists()) {
        const pData = profileDoc.data() as Profile;
        setProfile(pData);
        await setDBItem('profile', pData);
      }

      const projectsDoc = await getDoc(doc(db, "portfolio", "projects"));
      if (projectsDoc.exists()) {
        const data = projectsDoc.data();
        if (data && data.list) {
          setProjects(data.list);
          await setDBItem('projects', data.list);
        }
      }
      console.log("Firebase sync successful");
    } catch (e) {
      console.warn("Firebase sync failed, using local cache", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const savedConfig = await getDBItem('firebaseConfig');
        const savedProjects = await getDBItem('projects');
        const savedProfile = await getDBItem('profile');
        
        const currentConfig = savedConfig || DEFAULT_FIREBASE_CONFIG;
        setFirebaseConfig(currentConfig);
        if (savedProjects) setProjects(savedProjects);
        if (savedProfile) setProfile(savedProfile);

        // Background cloud sync
        await syncWithFirebase(currentConfig);
      } catch (e) {
        console.error("Data load failed", e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadData();
  }, []);

  const handleSaveAll = async (newProjects: Project[], newProfile: Profile, newConfig?: any) => {
    setProjects(newProjects);
    setProfile(newProfile);
    const configToUse = newConfig || firebaseConfig;
    if (newConfig) setFirebaseConfig(newConfig);

    // Save to Local
    await setDBItem('projects', newProjects);
    await setDBItem('profile', newProfile);
    if (newConfig) await setDBItem('firebaseConfig', newConfig);

    // Push to Firebase
    if (configToUse && configToUse.apiKey) {
      try {
        const app = !getApps().length ? initializeApp(configToUse) : getApp();
        const db = getFirestore(app);
        await setDoc(doc(db, "portfolio", "profile"), newProfile);
        await setDoc(doc(db, "portfolio", "projects"), { list: newProjects });
        console.log("Cloud save successful");
      } catch (e) {
        console.error("Cloud save failed", e);
      }
    }
  };

  useEffect(() => {
    if (!isHydrated || activeView !== 'main') return;
    const options = { root: scrollContainerRef.current, rootMargin: '-50% 0px -50% 0px', threshold: 0 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => { if (entry.isIntersecting) setCurrentPage(entry.target.id); });
    }, options);
    Object.values(sectionRefs).forEach((ref) => { if (ref.current) observer.observe(ref.current); });
    return () => observer.disconnect();
  }, [activeView, isHydrated, projects]);

  const handlePageChange = (pageId: string) => {
    if (pageId === 'admin') {
      if (isAdminLoggedIn) { setActiveView('admin'); window.scrollTo(0, 0); }
      else { setIsAdminModalOpen(true); }
      return;
    }
    if (activeView !== 'main') {
      setActiveView('main');
      setCurrentPage(pageId);
      setTimeout(() => { sectionRefs[pageId as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth' }); }, 50);
    } else {
      sectionRefs[pageId as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToProject = (slug: string) => {
    setSelectedProjectSlug(slug);
    setActiveView('project-detail');
    window.scrollTo(0, 0);
  };

  const handleBackToGallery = () => {
    setActiveView('main');
    setCurrentPage('works');
    setTimeout(() => { if (sectionRefs.works.current) sectionRefs.works.current.scrollIntoView({ behavior: 'auto', block: 'start' }); }, 30);
  };

  if (!isHydrated) {
    return (
      <div className="h-screen w-full bg-[#0E0E0E] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-bold">Synchronizing...</span>
      </div>
    );
  }

  const renderContent = () => {
    if (activeView === 'project-detail' && selectedProjectSlug !== null) {
      const project = projects.find(p => p.slug === selectedProjectSlug);
      if (project) return (
        <div key={`project-${selectedProjectSlug}`} className="bg-[#0E0E0E] h-full overflow-y-auto">
          <ProjectDetail project={project} allProjects={projects} onProjectSelect={handleNavigateToProject} onBack={handleBackToGallery} />
          <Footer profile={profile} />
        </div>
      );
    }
    if (activeView === 'admin') {
      return (
        <div key="admin-view" className="bg-[#0E0E0E] h-full overflow-y-auto pt-20">
          <Admin 
            projects={projects} 
            setProjects={(val) => {
              const newList = typeof val === 'function' ? (val as any)(projects) : val;
              handleSaveAll(newList, profile);
            }} 
            profile={profile} 
            setProfile={(val) => {
              const newProfile = typeof val === 'function' ? (val as any)(profile) : val;
              handleSaveAll(projects, newProfile);
            }} 
            firebaseConfig={firebaseConfig}
            setFirebaseConfig={(config) => handleSaveAll(projects, profile, config)}
          />
          <Footer profile={profile} />
        </div>
      );
    }
    return (
      <div className="snap-container h-full" ref={scrollContainerRef}>
        <section id="home" ref={sectionRefs.home} className="snap-section">
          <Home profile={profile} onNavigateToWorks={() => handlePageChange('works')} />
        </section>
        <section id="about" ref={sectionRefs.about} className="snap-section border-t border-white/5 bg-[#0A0A0A]">
          <About profile={profile} />
        </section>
        <section id="works" ref={sectionRefs.works} className="snap-section border-t border-white/5 bg-[#0E0E0E]">
          <Works projects={projects} onProjectClick={handleNavigateToProject} />
        </section>
        <section id="contact" ref={sectionRefs.contact} className="snap-section border-t border-white/5 bg-[#0E0E0E]">
          <Contact profile={profile} />
        </section>
        <Footer profile={profile} />
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col selection:bg-purple-500/30 selection:text-white bg-[#0E0E0E] overflow-hidden">
      <Navbar currentPage={activeView === 'main' ? currentPage : activeView} onPageChange={handlePageChange} onOpenAdmin={() => isAdminLoggedIn ? setActiveView('admin') : setIsAdminModalOpen(true)} />
      <main className="flex-grow overflow-hidden">{renderContent()}</main>
      <AdminModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onSuccess={() => { setIsAdminLoggedIn(true); setActiveView('admin'); }} />
    </div>
  );
};

export default App;
