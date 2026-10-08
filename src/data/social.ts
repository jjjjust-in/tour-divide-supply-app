// Social links shown on the Settings & About page.
// Leave `url` empty to show the platform as "Link coming soon".
export type SocialPlatform = 'instagram' | 'website';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  handle: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { platform: 'instagram', label: 'Instagram', handle: '@tourdividesupply', url: 'https://instagram.com/tourdividesupply' },
  { platform: 'website', label: 'Website', handle: 'tourdividesupply.com', url: 'https://tourdividesupply.com' },
];
