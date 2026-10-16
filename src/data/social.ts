// Connect links shown on the Settings & About page.
// Leave `url` empty to show the platform as "Link coming soon".
export type SocialPlatform = 'instagram' | 'website' | 'email';

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  handle: string;
  url: string;
}

export const socialLinks: SocialLink[] = [
  { platform: 'instagram', label: 'Instagram', handle: '@tourdividesupply', url: 'https://instagram.com/tourdividesupply' },
  { platform: 'website', label: 'Website', handle: 'tourdividesupply.com', url: 'https://tourdividesupply.com' },
  { platform: 'email', label: 'Email', handle: 'hello@justinmckinley.com', url: 'mailto:hello@justinmckinley.com' },
];
