
import React from 'react';
import { Profile } from '../types';

interface AboutProps {
  profile: Profile;
}

const About: React.FC<AboutProps> = ({ profile }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-40 pb-24 animate-in fade-in duration-1000">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        
        {/* Left Side: Photo & Personal Info */}
        <div className="space-y-12">
          <div className="aspect-[4/5] bg-white/5 border border-white/10 relative overflow-hidden group max-w-md">
            <img 
              src={profile.profileImageUrl || "https://picsum.photos/seed/artist/800/1000?grayscale"} 
              alt={profile.name}
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700"
            />
            <div className="absolute inset-0 border-2 border-purple-500/20 translate-x-4 translate-y-4 -z-10 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-500" />
          </div>

          <div>
            <h1 className="text-3xl font-bold mb-2 tracking-tight">{profile.name}</h1>
            <p className="text-purple-400 tracking-widest uppercase font-bold text-sm mb-6">{profile.alias}</p>
            <p className="text-xl text-white/80 font-light leading-relaxed mb-8">{profile.role}</p>
            <p className="text-white/60 leading-relaxed max-w-md">{profile.bio}</p>
          </div>

          <div className="flex gap-4">
            {profile.resumeUrl ? (
              <a 
                href={profile.resumeUrl} 
                download={`${profile.name}_CV.pdf`}
                className="bg-white text-black px-8 py-4 text-xs tracking-[0.3em] font-bold hover:bg-purple-400 hover:text-white transition-all uppercase inline-block"
              >
                Download CV (PDF)
              </a>
            ) : (
              <button className="bg-white/10 text-white/30 cursor-not-allowed px-8 py-4 text-xs tracking-[0.3em] font-bold uppercase">
                CV Not Uploaded
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Skills & Experience */}
        <div className="space-y-20">
          
          {/* Skills Section */}
          <section>
            <h2 className="text-xs tracking-[0.5em] text-white/40 uppercase mb-8 pb-4 border-b border-white/5">Expertise</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
              <div>
                <h3 className="text-sm tracking-widest uppercase font-bold text-purple-400 mb-6">3D & Simulation</h3>
                <ul className="space-y-4">
                  {profile.skills.threeD.map(skill => (
                    <li key={skill} className="text-lg font-light flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm tracking-widest uppercase font-bold text-purple-400 mb-6">2D & Post Production</h3>
                <ul className="space-y-4">
                  {profile.skills.twoD.map(skill => (
                    <li key={skill} className="text-lg font-light flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Education Section */}
          <section>
            <h2 className="text-xs tracking-[0.5em] text-white/40 uppercase mb-8 pb-4 border-b border-white/5">Education</h2>
            <div className="space-y-8">
              {profile.education?.map((edu, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-12 group cursor-default items-baseline">
                  <span className="text-sm text-white/40 tracking-widest pt-1 min-w-[140px]">{edu.period}</span>
                  <div className="flex flex-wrap items-baseline gap-x-4">
                    <span className="text-lg font-light text-white group-hover:text-purple-300 transition-colors">
                      {edu.school}
                    </span>
                    <span className="text-xl text-white/80 uppercase tracking-widest font-bold">
                      {edu.major}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Experience Section */}
          <section>
            <h2 className="text-xs tracking-[0.5em] text-white/40 uppercase mb-8 pb-4 border-b border-white/5">Experience & Awards</h2>
            <div className="space-y-8">
              {profile.experience.map((exp, idx) => (
                <div key={idx} className="flex gap-12 group cursor-default">
                  <span className="text-sm text-white/40 tracking-widest pt-1 min-w-[140px] md:min-w-0">{exp.year}</span>
                  <div>
                    <p className="text-lg font-light group-hover:text-purple-300 transition-colors">{exp.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Strength Section */}
          {profile.strengths && profile.strengths.length > 0 && (
            <section className="bg-white/5 p-12 border-l border-purple-500">
               <h2 className="text-xs tracking-[0.5em] text-white/40 uppercase mb-6">Strengths</h2>
               <ul className="space-y-6 text-lg italic font-serif text-white/80">
                  {profile.strengths.map((str, idx) => (
                    <li key={idx}>"{str}"</li>
                  ))}
               </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default About;
