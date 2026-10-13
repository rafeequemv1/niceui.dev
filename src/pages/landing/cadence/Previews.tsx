import type { ReactNode } from 'react';
import {
  BadgeCheck,
  BarChart2,
  Bookmark,
  Globe2,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Music2,
  Repeat2,
  Send,
  Share,
  ThumbsUp,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { IMG, PEOPLE } from './shared';
import { NetworkBadge, networkMap, type NetworkId } from './logos';

const LI_ACTIONS: [LucideIcon, string][] = [
  [ThumbsUp, 'Like'],
  [MessageCircle, 'Comment'],
  [Repeat2, 'Repost'],
  [Send, 'Send'],
];

const TT_ACTIONS: [LucideIcon, string][] = [
  [Heart, '84K'],
  [MessageCircle, '1.2K'],
  [Bookmark, '9.8K'],
  [Share, '3.1K'],
];

const BRAND = { name: 'Cadence Coffee', handle: 'cadencecoffee', img: PEOPLE.theo.img };

function Rich({ text, tagClass }: { text: string; tagClass: string }) {
  const parts = text.split(/(\s+)/);
  return (
    <>
      {parts.map((p, i) =>
        /^[#@]\w+/.test(p) ? (
          <span key={i} className={tagClass}>{p}</span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Shell({ id, children, className }: { id: NetworkId; children: ReactNode; className?: string }) {
  return (
    <div className={cn('cad-pop mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-[0_12px_32px_-16px_rgba(28,25,23,0.25)]', className)}>
      <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/70 px-3 py-2 text-[11px] font-medium text-stone-500">
        <NetworkBadge id={id} size="xs" />
        {networkMap[id].name} preview
      </div>
      {children}
    </div>
  );
}

function Caret({ on }: { on: boolean }) {
  return on ? <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-blink bg-[#FF5A36]" /> : null;
}

export function XPreview({ text, streaming }: { text: string; streaming: boolean }) {
  const limit = networkMap.x.limit;
  const ok = text.slice(0, limit);
  const over = text.slice(limit);
  return (
    <Shell id="x">
      <div className="flex gap-3 p-4">
        <img src={BRAND.img} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 text-[15px] leading-tight">
            <span className="truncate font-semibold text-stone-950">{BRAND.name}</span>
            <BadgeCheck className="h-4 w-4 shrink-0 fill-sky-500 text-white" />
            <span className="truncate text-stone-500">@{BRAND.handle} · 2m</span>
          </div>
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-normal text-stone-900">
            <Rich text={ok} tagClass="text-sky-600" />
            {over && <span className="rounded bg-rose-100 text-rose-700">{over}</span>}
            <Caret on={streaming} />
          </p>
          <img src={IMG.latteArt} alt="" className="mt-3 aspect-[16/10] w-full rounded-2xl border border-stone-200 object-cover" />
          <div className="mt-3 flex justify-between pr-4 text-[13px] text-stone-500">
            <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" />24</span>
            <span className="flex items-center gap-1.5"><Repeat2 className="h-4 w-4" />118</span>
            <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" />1.2K</span>
            <span className="flex items-center gap-1.5"><BarChart2 className="h-4 w-4" />48K</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}

export function InstagramPreview({ text, streaming }: { text: string; streaming: boolean }) {
  const short = text.length > 125 ? text.slice(0, 125).trimEnd() : text;
  return (
    <Shell id="instagram">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <span className="rounded-full bg-[conic-gradient(from_180deg,#feda75,#fa7e1e,#d62976,#feda75)] p-[2px]">
          <img src={BRAND.img} alt="" className="h-8 w-8 rounded-full border-2 border-white object-cover" />
        </span>
        <div className="flex-1 text-sm font-semibold text-stone-950">{BRAND.handle}</div>
        <MoreHorizontal className="h-5 w-5 text-stone-700" />
      </div>
      <img src={IMG.latte} alt="" className="aspect-square w-full object-cover" />
      <div className="px-3 pb-4 pt-3">
        <div className="flex items-center gap-4 text-stone-900">
          <Heart className="h-6 w-6 transition-transform hover:scale-110" />
          <MessageCircle className="h-6 w-6" />
          <Send className="h-6 w-6" />
          <Bookmark className="ml-auto h-6 w-6" />
        </div>
        <div className="mt-2 text-sm font-semibold text-stone-950">2,481 likes</div>
        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-normal text-stone-900">
          <span className="mr-1.5 font-semibold">{BRAND.handle}</span>
          <Rich text={short} tagClass="text-sky-800" />
          {short.length < text.length && <span className="text-stone-500">… more</span>}
          <Caret on={streaming} />
        </p>
      </div>
    </Shell>
  );
}

export function LinkedInPreview({ text, streaming }: { text: string; streaming: boolean }) {
  const short = text.length > 210 ? text.slice(0, 210).trimEnd() : text;
  return (
    <Shell id="linkedin">
      <div className="flex gap-2.5 px-4 pt-4">
        <img src={BRAND.img} alt="" className="h-12 w-12 rounded-md object-cover" />
        <div className="min-w-0 leading-tight">
          <div className="text-sm font-semibold text-stone-950">{BRAND.name}</div>
          <div className="text-xs text-stone-500">12,408 followers</div>
          <div className="mt-0.5 flex items-center gap-1 text-xs text-stone-500">2m · <Globe2 className="h-3 w-3" /></div>
        </div>
      </div>
      <p className="whitespace-pre-wrap break-words px-4 py-3 text-sm leading-normal text-stone-900">
        <Rich text={short} tagClass="font-semibold text-[#0A66C2]" />
        {short.length < text.length && <span className="text-stone-500">…see more</span>}
        <Caret on={streaming} />
      </p>
      <img src={IMG.interior} alt="" className="aspect-[1.91/1] w-full object-cover" />
      <div className="flex items-center gap-1 px-4 py-2 text-xs text-stone-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0A66C2]"><ThumbsUp className="h-2.5 w-2.5 fill-white text-white" /></span>
        <span className="-ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500"><Heart className="h-2.5 w-2.5 fill-white text-white" /></span>
        <span className="ml-1">342 · 28 comments</span>
      </div>
      <div className="grid grid-cols-4 border-t border-stone-100 px-2 py-1 text-xs font-medium text-stone-600">
        {LI_ACTIONS.map(([Icon, label]) => (
          <span key={label} className="flex items-center justify-center gap-1.5 rounded-md py-2 hover:bg-stone-100">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </span>
        ))}
      </div>
    </Shell>
  );
}

export function TikTokPreview({ text, streaming }: { text: string; streaming: boolean }) {
  const short = text.length > 150 ? `${text.slice(0, 150).trimEnd()}…` : text;
  return (
    <Shell id="tiktok">
      <div className="relative aspect-[9/14] bg-stone-950">
        <img src={IMG.cappuccino} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
        <div className="absolute inset-x-0 top-3 flex justify-center gap-4 text-sm font-semibold text-white/70">
          <span>Following</span>
          <span className="text-white underline decoration-2 underline-offset-8">For You</span>
        </div>
        <div className="absolute bottom-20 right-3 flex flex-col items-center gap-4 text-white">
          <img src={BRAND.img} alt="" className="h-10 w-10 rounded-full border-2 border-white object-cover" />
          {TT_ACTIONS.map(([Icon, n]) => (
            <span key={n} className="flex flex-col items-center text-[11px] font-semibold">
              <Icon className="h-7 w-7 fill-white/95 drop-shadow" />
              {n}
            </span>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 p-4 pr-16 text-white">
          <div className="text-sm font-semibold">@{BRAND.handle}</div>
          <p className="mt-1 whitespace-pre-wrap break-words text-[13px] leading-snug">
            <Rich text={short} tagClass="font-semibold" />
            <Caret on={streaming} />
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <Music2 className="h-3.5 w-3.5" />
            <span className="truncate">original sound · Cadence Coffee</span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
