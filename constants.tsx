
import { Project, Profile } from './types';

export const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyAqHOx1QSbBxIF9B-UaV2vSlKPzCZehNSI",
  authDomain: "haemonga.firebaseapp.com",
  projectId: "haemonga",
  storageBucket: "haemonga.firebasestorage.app",
  messagingSenderId: "469503456003",
  appId: "1:469503456003:web:3b6d064dd4a6ed4a55af36",
  measurementId: "G-03JPK5M8XC"
};

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'The Silent Echo',
    slug: 'silent-echo',
    category: 'Surreal',
    shortDesc: 'A visual exploration of repressed memories and the weight of silence.',
    duration: '02:45',
    role: 'Art Direction, 3D Design, Animation',
    tools: ['Cinema 4D', 'Octane Render', 'After Effects'],
    year: '2024',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1280',
    blocks: [
      {
        id: 'b1',
        type: 'video',
        data: '<iframe src="https://player.vimeo.com/video/100000000" width="640" height="360" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
      },
      {
        id: 'b2',
        type: 'concept',
        data: {
          background: '이 프로젝트는 "말하지 못한 단어들"에 대한 명상에서 시작되었습니다.',
          visualStrategy: '부유하는 기하학적 형태와 액체 질감을 사용하여 불안정성을 시각화했습니다.',
          message: '침묵은 결코 비어있지 않습니다.'
        }
      },
      {
        id: 'b3',
        type: 'large-image',
        data: 'https://images.unsplash.com/photo-1633167606207-d840b5070fc2?auto=format&fit=crop&q=80&w=1920',
        settings: { width: 'w-full' }
      },
      {
        id: 'b4',
        type: 'text',
        data: 'Silence is never truly empty; it is filled with the weight of everything we choose not to say.',
        settings: { fontSize: 'text-3xl', fontFamily: 'font-serif', textAlign: 'text-center' }
      }
    ]
  }
];

export const INITIAL_PROFILE: Profile = {
  name: '전혜미 (Haemi Jeon)',
  alias: '해몽가 (Haemonga)',
  homeTitle: 'HAEMONGA',
  showHomeTitle: true,
  homeSubtitle: 'Jeon Haemi',
  role: '3D Generalist',
  email: 'contact@haemonga.com',
  behance: 'https://www.behance.net/haemonga',
  notefolio: 'https://notefolio.net/haemonga',
  bio: '초현실적이고 상징적인 시각적 스토리텔링을 통해 사회적 메시지와 인간의 내면을 탐구합니다.',
  heroImageUrl: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=1920',
  profileImageUrl: 'https://images.unsplash.com/photo-1514525253344-f81bad3b7436?auto=format&fit=crop&q=80&w=800',
  resumeUrl: '',
  skills: {
    threeD: ['Cinema 4D', 'Octane Render', 'Marvelous Designer'],
    twoD: ['After Effects', 'Premiere Pro', 'Photoshop']
  },
  experience: [
    { year: '2024', title: '개인전: [침묵의 울림] - 성수동 갤러리 A' }
  ],
  education: [
    { period: '2021.03 ~ 2025.02', school: '동아방송예술대학교', major: '디지털영상디자인과' }
  ],
  strengths: [
    "컨셉 중심의 논리적인 기획 능력",
    "상징적이고 철학적인 비주얼 연출",
    "사회적 메시지의 감각적 시각화"
  ]
};
