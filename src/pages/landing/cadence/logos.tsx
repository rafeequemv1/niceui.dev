import type { ComponentType } from 'react';
import { Facebook, Instagram, Linkedin, Youtube, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

type LogoProps = { className?: string };

export function XLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export function TikTokLogo({ className }: LogoProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
    </svg>
  );
}

const wrapLucide = (Icon: LucideIcon) =>
  function LucideLogo({ className }: LogoProps) {
    return <Icon className={className} strokeWidth={2} />;
  };

export const InstagramLogo = wrapLucide(Instagram);
export const FacebookLogo = wrapLucide(Facebook);
export const LinkedinLogo = wrapLucide(Linkedin);
export const YoutubeLogo = wrapLucide(Youtube);

export type NetworkId = 'x' | 'instagram' | 'linkedin' | 'tiktok' | 'facebook' | 'youtube';

export type Network = {
  id: NetworkId;
  name: string;
  color: string;
  limit: number;
  Logo: ComponentType<LogoProps>;
};

export const networks: Network[] = [
  { id: 'instagram', name: 'Instagram', color: '#E4405F', limit: 2200, Logo: InstagramLogo },
  { id: 'x', name: 'X', color: '#000000', limit: 280, Logo: XLogo },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2', limit: 3000, Logo: LinkedinLogo },
  { id: 'tiktok', name: 'TikTok', color: '#000000', limit: 2200, Logo: TikTokLogo },
  { id: 'facebook', name: 'Facebook', color: '#0866FF', limit: 63206, Logo: FacebookLogo },
  { id: 'youtube', name: 'YouTube', color: '#FF0000', limit: 5000, Logo: YoutubeLogo },
];

export const networkMap = Object.fromEntries(networks.map((n) => [n.id, n])) as Record<NetworkId, Network>;

export const INSTAGRAM_GRADIENT =
  'radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)';

const sizes = {
  xs: { tile: 'h-5 w-5 rounded-md', icon: 'h-3 w-3' },
  sm: { tile: 'h-7 w-7 rounded-lg', icon: 'h-3.5 w-3.5' },
  md: { tile: 'h-10 w-10 rounded-xl', icon: 'h-5 w-5' },
  lg: { tile: 'h-14 w-14 rounded-2xl', icon: 'h-7 w-7' },
};

export function NetworkBadge({
  id,
  size = 'md',
  variant = 'solid',
  className,
}: {
  id: NetworkId;
  size?: keyof typeof sizes;
  variant?: 'solid' | 'soft';
  className?: string;
}) {
  const n = networkMap[id];
  const s = sizes[size];
  if (variant === 'soft') {
    return (
      <span
        className={cn('inline-flex shrink-0 items-center justify-center bg-white ring-1 ring-stone-200', s.tile, className)}
        style={{ color: n.color }}
        aria-label={n.name}
      >
        <n.Logo className={s.icon} />
      </span>
    );
  }
  const background = id === 'instagram' ? INSTAGRAM_GRADIENT : n.color;
  return (
    <span
      className={cn('relative inline-flex shrink-0 items-center justify-center text-white shadow-sm', s.tile, className)}
      style={{ background }}
      aria-label={n.name}
    >
      {id === 'tiktok' ? (
        <span className={cn('relative', s.icon)}>
          <TikTokLogo className="absolute inset-0 h-full w-full -translate-x-[1px] -translate-y-[1px] text-[#25F4EE]" />
          <TikTokLogo className="absolute inset-0 h-full w-full translate-x-[1px] translate-y-[1px] text-[#FE2C55]" />
          <TikTokLogo className="absolute inset-0 h-full w-full text-white" />
        </span>
      ) : (
        <n.Logo className={s.icon} />
      )}
    </span>
  );
}
