export const SITE = {
  title: 'David Berry',
  tagline: 'Engineering educator. Infrastructure operator. AI governance in practice.',
  description:
    'Field notes on security incidents, AI governance, and running production infrastructure with no team and no budget.',
  url: 'https://davidcberry.com',
  author: 'David Berry',
  email: 'david@davidcberry.com',
  newsletter: 'https://davidcberry.substack.com/',
} as const;

export type Topic = 'cyber' | 'ai-governance' | 'career' | 'reading';

// One place that owns topic labels and blurbs. The topic pages, the filter
// row and the article meta line all read from here, so a rename happens once.
export const TOPICS: Record<Topic, { label: string; blurb: string }> = {
  cyber: {
    label: 'Security',
    blurb:
      'Incidents I worked, controls I built, and the ones that were quietly missing. First-hand, including the parts that went badly.',
  },
  'ai-governance': {
    label: 'AI Governance',
    blurb:
      'Implemented controls rather than framework citations. What it actually takes to keep student data out of a vendor API.',
  },
  career: {
    label: 'Career',
    blurb: 'Moving from the classroom into security and AI governance work, in public.',
  },
  reading: {
    label: 'Reading',
    blurb:
      'Shorter responses to papers, postmortems and docs worth arguing with. Thinking out loud, not finished positions.',
  },
};

export const NAV = [
  { href: '/writing/', label: 'Writing' },
  { href: '/topics/cyber/', label: 'Security' },
  { href: '/topics/ai-governance/', label: 'AI Governance' },
  { href: '/about/', label: 'About' },
] as const;
