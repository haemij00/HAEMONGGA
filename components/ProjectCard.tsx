
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: (slug: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const isVideo = project.thumbnailUrl?.startsWith('data:video') || project.thumbnailUrl?.endsWith('.mp4') || project.thumbnailUrl?.endsWith('.webm');

  return (
    <div 
      className="group cursor-pointer relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick(project.slug)}
    >
      {/* aspect-video 제거 -> 원본 비율 유지 */}
      <div className="relative w-full overflow-hidden bg-white/5 transition-all duration-500 transform group-hover:-translate-y-2">
        {isVideo ? (
          <video
            src={project.thumbnailUrl}
            autoPlay
            muted
            loop
            playsInline
            className={`w-full h-auto transition-transform duration-700 ${isHovered ? 'scale-105 opacity-40' : 'scale-100 opacity-80'}`}
          />
        ) : (
          <img 
            src={project.thumbnailUrl} 
            alt={project.title}
            className={`w-full h-auto transition-transform duration-700 ${isHovered ? 'scale-105 opacity-40' : 'scale-100 opacity-80'}`}
          />
        )}
        
        {/* Simple Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border border-white/30 rounded-full flex items-center justify-center backdrop-blur-sm animate-pulse">
              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
            </div>
          </div>
        )}

        <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
          {/* User requested to remove the metadata tags (category and duration) */}
          <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-purple-300 transition-colors font-serif">
            {project.title}
          </h3>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
