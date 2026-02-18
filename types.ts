
export type ProjectCategory = 'All' | 'Surreal' | 'Social' | 'Fantasy' | 'Environment';

export type BlockType = 'concept' | 'storyboard' | 'gallery' | 'grid-gallery' | 'process' | 'video' | 'text' | 'large-image';

export interface ContentBlock {
  id: string;
  type: BlockType;
  data: any;
  settings?: {
    fontSize?: 'text-sm' | 'text-base' | 'text-xl' | 'text-3xl' | 'text-5xl' | 'text-7xl';
    fontFamily?: 'font-sans' | 'font-serif'; // font-serif: Section Font(Bold), font-sans: Content Font(Light)
    textAlign?: 'text-left' | 'text-center' | 'text-right';
    width?: 'w-1/2' | 'w-3/4' | 'w-full';
    columns?: number; // For grid-gallery: 2, 3, 4
    verticalSpacing?: 'py-0' | 'py-12' | 'py-24' | 'py-32' | 'py-48' | 'py-64'; // New: Section Spacing
  };
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  category: ProjectCategory;
  shortDesc: string;
  duration: string;
  role: string;
  tools: string[];
  year: string;
  thumbnailUrl: string;
  blocks: ContentBlock[];
}

export interface Profile {
  name: string;
  alias: string;
  role: string;
  email: string;
  behance: string;
  notefolio: string;
  bio: string;
  heroImageUrl: string;
  profileImageUrl: string;
  resumeUrl: string;
  skills: {
    threeD: string[];
    twoD: string[];
  };
  experience: {
    year: string;
    title: string;
  }[];
  education: {
    period: string;
    school: string;
    major: string;
  }[];
}
