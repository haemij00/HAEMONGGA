
import React from 'react';
import ProjectCard from '../components/ProjectCard';
import { Project } from '../types';

interface WorksProps {
  projects: Project[];
  onProjectClick: (slug: string) => void;
}

const Works: React.FC<WorksProps> = ({ projects, onProjectClick }) => {
  return (
    <div className="min-h-screen py-24 max-w-7xl mx-auto px-6 animate-in fade-in duration-500">
      <header className="mb-20 text-center">
        <span className="text-xs tracking-[0.5em] text-purple-400 uppercase mb-4 block font-bold">Archives</span>
        <h1 className="text-5xl font-serif mb-8 tracking-tight uppercase">Selected Works</h1>
        <div className="w-24 h-px bg-white/10 mx-auto" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-12 md:gap-16">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={onProjectClick} 
          />
        ))}
      </div>

      {projects.length === 0 && (
        <div className="py-20 text-center text-white/40 tracking-widest italic">
          No projects available in the gallery.
        </div>
      )}
    </div>
  );
};

export default Works;