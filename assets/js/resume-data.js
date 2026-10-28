// Data model, defaults and sample content.

export const ACCENTS = [
  { name: 'Navy', value: '#1F3A5F' },
  { name: 'Teal', value: '#0E7C7B' },
  { name: 'Crimson', value: '#B23A48' },
  { name: 'Forest', value: '#2F6B4F' },
  { name: 'Plum', value: '#6B3FA0' },
  { name: 'Graphite', value: '#2B2F36' },
];

export const TEMPLATES = [
  { id: 'classic', name: 'Classic', image: '/assets/images/templates/classic.webp' },
  { id: 'modern', name: 'Modern', image: '/assets/images/templates/modern.webp' },
  { id: 'minimal', name: 'Minimal', image: '/assets/images/templates/minimal.webp' },
  { id: 'professional', name: 'Professional', image: '/assets/images/templates/professional.webp' },
];

// Only photos produced by photo-upload.js are accepted.
export const PHOTO_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;

export const LIST_NAMES = ['experience', 'education', 'projects'];

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

export const newItem = {
  experience: () => ({ id: uid(), role: '', company: '', location: '', start: '', end: '', description: '' }),
  education: () => ({ id: uid(), degree: '', school: '', start: '', end: '', details: '' }),
  projects: () => ({ id: uid(), name: '', link: '', description: '' }),
};

export function emptyData() {
  return {
    template: 'classic',
    accent: ACCENTS[0].value,
    personal: { fullName: '', jobTitle: '', email: '', phone: '', location: '', website: '', photo: '' },
    summary: '',
    experience: [],
    education: [],
    projects: [],
    skills: '',
    languages: '',
  };
}

export function sampleData() {
  const d = emptyData();
  d.personal = {
    fullName: 'Priya Raman',
    jobTitle: 'Product Designer',
    email: 'priya.raman@example.com',
    phone: '+1 555 010 4477',
    location: 'Austin, TX',
    website: 'priyaraman.design',
    photo: '',
  };
  d.summary =
    'Product designer with 7 years of experience shipping web and mobile apps for logistics and fintech teams. I turn messy workflows into simple screens, and I work closely with engineers from the first sketch to launch.';
  d.experience = [
    {
      id: uid(), role: 'Senior Product Designer', company: 'Fleetwise', location: 'Austin, TX',
      start: 'Mar 2022', end: 'Present',
      description:
        'Redesigned the dispatcher dashboard, cutting average task time from 9 to 5 minutes\nLed a 4-person design team and set up a shared component library used by 12 engineers\nRan 30+ user interviews that shaped the 2024 product roadmap',
    },
    {
      id: uid(), role: 'Product Designer', company: 'Ledgerly', location: 'Remote',
      start: 'Jun 2019', end: 'Feb 2022',
      description:
        'Designed the invoicing flow that grew paid conversion by 18%\nPartnered with support to turn the top 10 complaints into design fixes',
    },
  ];
  d.education = [
    {
      id: uid(), degree: 'BDes, Interaction Design', school: 'University of Texas at Austin',
      start: '2014', end: '2018', details: 'Graduated with honors',
    },
  ];
  d.projects = [
    {
      id: uid(), name: 'Pocket Pantry', link: 'pocketpantry.app',
      description: 'Side project: a meal-planning app with 8,000 monthly users',
    },
  ];
  d.skills = 'Figma, User research, Prototyping, Design systems, Accessibility, HTML & CSS';
  d.languages = 'English (native), Tamil (fluent), Spanish (conversational)';
  return d;
}

// Makes sure data loaded from storage has the right shape, so bad data can't break the page.
export function normalize(raw) {
  const out = emptyData();
  if (!raw || typeof raw !== 'object') return out;
  const str = (v) => (typeof v === 'string' ? v : '');

  out.template = TEMPLATES.some((t) => t.id === raw.template) ? raw.template : out.template;
  out.accent = ACCENTS.some((a) => a.value === raw.accent) ? raw.accent : out.accent;

  for (const key of Object.keys(out.personal)) out.personal[key] = str(raw.personal && raw.personal[key]);
  if (!PHOTO_RE.test(out.personal.photo)) out.personal.photo = '';

  out.summary = str(raw.summary);
  out.skills = str(raw.skills);
  out.languages = str(raw.languages);

  for (const list of LIST_NAMES) {
    const rows = Array.isArray(raw[list]) ? raw[list].slice(0, 30) : [];
    out[list] = rows.map((row) => {
      const item = newItem[list]();
      for (const key of Object.keys(item)) {
        if (key !== 'id') item[key] = str(row && row[key]);
      }
      if (row && typeof row.id === 'string' && /^[a-z0-9]{3,12}$/.test(row.id)) item.id = row.id;
      return item;
    });
  }
  return out;
}
