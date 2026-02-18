
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminModal from './components/AdminModal';
import { Project, Profile } from './types';
import { INITIAL_PROJECTS, INITIAL_PROFILE } from './constants';

// Pages/Sections
import Home from './pages/Home';
import Works from './pages/Works';
import ProjectDetail from './pages/ProjectDetail';
import About from './pages/About';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

// Simple IndexedDB Wrapper for high-capacity storage
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

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = {
    home: useRef<HTMLElement>(null),
    about: useRef<HTMLElement>(null),
    works: useRef<HTMLElement>(null),
    contact: useRef<HTMLElement>(null),
  };

  // Load data from IndexedDB on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedProjects = await getDBItem('projects');
        const savedProfile = await getDBItem('profile');
        if (savedProjects) setProjects(savedProjects);
        if (savedProfile) setProfile(savedProfile);
      } catch (e) {
        console.error("Failed to load data from IndexedDB", e);
      } finally {
        setIsHydrated(true);
      }
    };
    loadData();
  }, []);

  // Save data to IndexedDB whenever state changes
  useEffect(() => {
    if (!isHydrated) return;
    setDBItem('projects', projects).catch(e => console.error("Save projects failed", e));
  }, [projects, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    setDBItem('profile', profile).catch(e => console.error("Save profile failed", e));
  }, [profile, isHydrated]);

  // Intersection Observer for Scroll Sync
  useEffect(() => {
    if (!isHydrated || activeView !== 'main') return;

    const options = {
      root: scrollContainerRef.current,
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentPage(entry.target.id);
        }
      });
    }, options);

    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [activeView, isHydrated, projects]);

  const handlePageChange = (pageId: string) => {
    if (pageId === 'admin') {
      if (isAdminLoggedIn) {
        setActiveView('admin');
        window.scrollTo(0, 0);
      } else {
        setIsAdminModalOpen(true);
      }
      return;
    }

    if (activeView !== 'main') {
      setActiveView('main');
      setTimeout(() => {
        sectionRefs[pageId as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      sectionRefs[pageId as keyof typeof sectionRefs]?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToProject = (slug: string) => {
    setSelectedProjectSlug(slug);
    setActiveView('project-detail');
    window.scrollTo(0, 0);
  };

  if (!isHydrated) {
    return (
      <div className="h-screen w-full bg-[#0E0E0E] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-t-2 border-purple-500 rounded-full animate-spin" />
        <span className="text-[10px] tracking-[0.5em] text-white/30 uppercase font-bold">Initializing Gallery...</span>
      </div>
    );
  }

  const renderContent = () => {
    if (activeView === 'project-detail' && selectedProjectSlug) {
      const project = projects.find(p => p.slug === selectedProjectSlug);
      if (project) return (
        <div key={`project-${selectedProjectSlug}`} className="bg-[#0E0E0E] h-full overflow-y-auto">
          <ProjectDetail project={project} onBack={() => setActiveView('main')} />
          <Footer profile={profile} />
        </div>
      );
    }

    if (activeView === 'admin') {
      return (
        <div key="admin-view" className="bg-[#0E0E0E] h-full overflow-y-auto pt-20">
          <Admin projects={projects} setProjects={setProjects} profile={profile} setProfile={setProfile} />
          <Footer profile={profile} />
        </div>
      );
    }

    return (
      <div className="snap-container h-full" ref={scrollContainerRef}>
        <section id="home" ref={sectionRefs.home} className="snap-section">
          <Home 
            heroImageUrl={profile.heroImageUrl}
            onNavigateToWorks={() => handlePageChange('works')} 
          />
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
      <Navbar 
        currentPage={activeView === 'main' ? currentPage : activeView} 
        onPageChange={handlePageChange} 
        onOpenAdmin={() => isAdminLoggedIn ? setActiveView('admin') : setIsAdminModalOpen(true)}
      />
      
      <main className="flex-grow overflow-hidden">
        {renderContent()}
      </main>

      <AdminModal 
        isOpen={isAdminModalOpen} 
        onClose={() => setIsAdminModalOpen(false)} 
        onSuccess={() => {
          setIsAdminLoggedIn(true);
          setActiveView('admin');
        }} 
      />
    </div>
  );
};

export default App;
