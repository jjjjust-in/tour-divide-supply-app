// Social links shown on the Settings & About page.
// Leave `url` empty to show the platform as "Link coming soon".
export type SocialPlatform = 'instagram' | 'youtube' | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  handle: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { platform: 'instagram', label: 'Instagram', handle: '', url: '' },
  { platform: 'youtube', label: 'YouTube', handle: '', url: '' },
  { platform: 'website', label: 'Website', handle: 'tourdividesupply.com', url: 'https://tourdividesupply.com' },
];
