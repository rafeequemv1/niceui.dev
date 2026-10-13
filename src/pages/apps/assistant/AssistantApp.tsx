import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Clapperboard, Code2, Globe, ImageIcon, PanelLeftOpen, PenLine, Share, SquarePen, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useAssistant } from './useAssistant';
import { suggestions } from './data';
import { Sidebar } from './Sidebar';
import { Composer } from './Composer';
import { ArtifactPanel } from './ArtifactPanel';
import { AssistantMessageView, UserMessage } from './Message';
import type { Artifact } from './types';

const tagIcon = { Code: Code2, Image: ImageIcon, Video: Clapperboard, Search: Globe, Write: PenLine, Error: TriangleAlert } as const;

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export function AssistantApp() {
  const api = useAssistant();
  const { active } = api;
  const [sidebar, setSidebar] = useState(true);
  const [drawer, setDrawer] = useState(false);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [stick, setStick] = useState(true);
  const scroller = useRef<HTMLDivElement>(null);
  const autoOpened = useRef(new Set<string>());

  const selectChat = (id: string | null) => {
    api.setActiveId(id);
    setArtifact(null);
    setDrawer(false);
    setStick(true);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        selectChat(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const messages = active?.messages;
  useEffect(() => {
    if (stick) scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages, stick]);

  useEffect(() => {
    if (!messages || !api.streamingId) return;
    const msg = messages.find((m) => m.id === api.streamingId);
    if (!msg || msg.role !== 'assistant') return;
    for (const p of msg.parts) {
      if (p.type === 'artifact' && !autoOpened.current.has(p.artifact.id)) {
        autoOpened.current.add(p.artifact.id);
        setArtifact(p.artifact);
      }
    }
  }, [messages, api.streamingId]);

  useEffect(() => {
    if (!artifact || !messages) return;
    for (const m of messages) {
      if (m.role !== 'assistant') continue;
      for (const p of m.parts) {
        if (p.type === 'artifact' && p.artifact.id === artifact.id && p.artifact !== artifact) setArtifact(p.artifact);
      }
    }
  }, [messages, artifact]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) setStick(el.scrollHeight - el.scrollTop - el.clientHeight < 80);
  };

  const sidebarProps = {
    conversations: api.conversations,
    activeId: api.activeId,
    onSelect: selectChat,
    onRename: api.renameChat,
    onPin: api.togglePin,
    onDelete: api.deleteChat,
  };

  const composer = (
    <Composer
      onSend={(t, a, m) => { setStick(true); api.send(t, a, m); }}
      onStop={api.stop}
      isStreaming={api.isStreaming}
      model={api.model}
      onModel={api.setModelId}
      extended={api.extended}
      onExtended={api.setExtended}
      autoFocus={!active}
    />
  );

  const lastAssistant = messages ? [...messages].reverse().find((m) => m.role === 'assistant')?.id : undefined;
  const lastUser = messages ? [...messages].reverse().find((m) => m.role === 'user')?.id : undefined;

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] overflow-hidden bg-ink-950 text-ink-100">
      <div className={cn('hidden shrink-0 overflow-hidden transition-[width] duration-500 ease-smooth lg:block', sidebar ? 'w-[272px]' : 'w-0')}>
        <Sidebar {...sidebarProps} onClose={() => setSidebar(false)} />
      </div>

      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setDrawer(false)} />
          <div className="relative h-full w-[272px] animate-fade-in">
            <Sidebar {...sidebarProps} onClose={() => setDrawer(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1">
        <main className={cn('relative flex min-w-0 flex-1 flex-col', artifact && 'hidden md:flex')}>
          <header className="flex h-14 shrink-0 items-center gap-1 px-3">
            <button onClick={() => setDrawer(true)} aria-label="Open sidebar" className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white lg:hidden">
              <PanelLeftOpen className="h-4 w-4" />
            </button>
            {!sidebar && (
              <>
                <button onClick={() => setSidebar(true)} aria-label="Open sidebar" className="hidden h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white lg:grid">
                  <PanelLeftOpen className="h-4 w-4" />
                </button>
                <button onClick={() => selectChat(null)} aria-label="New chat" className="hidden h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-white/5 hover:text-white lg:grid">
                  <SquarePen className="h-4 w-4" />
                </button>
              </>
            )}
            <div className="ml-1 min-w-0 flex-1 truncate text-sm font-medium text-ink-200">{active?.title ?? ''}</div>
            {active && (
              <button className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-medium text-ink-200 transition-colors hover:bg-white/5">
                <Share className="h-3.5 w-3.5" /> Share
              </button>
            )}
          </header>

          {!active ? (
            <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 pb-10">
              <div className="w-full max-w-2xl">
                <h1 className="mb-8 text-center font-serif text-4xl text-ink-50 animate-fade-up sm:text-5xl">
                  {greeting()}, <span className="italic text-brand-300">Alex</span>
                </h1>
                <div className="animate-fade-up [animation-delay:80ms]">{composer}</div>
                <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {suggestions.map((s, i) => {
                    const Icon = tagIcon[s.tag as keyof typeof tagIcon];
                    return (
                      <button
                        key={s.label}
                        onClick={() => { setStick(true); api.send(s.prompt, [], 'auto'); }}
                        style={{ animationDelay: `${160 + i * 50}ms` }}
                        className="group flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-left opacity-0 transition-all duration-300 animate-fade-up [animation-fill-mode:forwards] hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
                      >
                        <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg', s.tag === 'Error' ? 'bg-rose-500/10 text-rose-300' : 'bg-brand-500/10 text-brand-300')}>
                          {Icon && <Icon className="h-4 w-4" />}
                        </span>
                        <span className="text-[13px] leading-snug text-ink-300 group-hover:text-ink-100">{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div ref={scroller} onScroll={onScroll} className="flex-1 overflow-y-auto">
                <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-8 pt-4">
                  {active.messages.map((m) =>
                    m.role === 'user' ? (
                      <UserMessage key={m.id} msg={m} canEdit={!api.isStreaming && m.id === lastUser} onEdit={(t) => api.editMessage(m.id, t)} />
                    ) : (
                      <AssistantMessageView
                        key={m.id}
                        msg={m}
                        isLast={m.id === lastAssistant}
                        openArtifact={artifact?.id ?? null}
                        onOpenArtifact={(a) => setArtifact((cur) => (cur?.id === a.id ? null : a))}
                        onRegenerate={() => api.regenerate(m.id)}
                        onRate={(r) => api.rate(m.id, r)}
                        onPrompt={(t) => { setStick(true); api.send(t, [], 'image'); }}
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-3xl px-4 pb-4">
                {!stick && (
                  <button
                    onClick={() => setStick(true)}
                    aria-label="Jump to latest"
                    className="absolute -top-12 left-1/2 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full border border-white/10 bg-ink-900 text-ink-200 shadow-pop animate-fade-up hover:text-white"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                )}
                {composer}
              </div>
            </>
          )}
        </main>

        {artifact && (
          <div className="w-full shrink-0 border-l border-white/[0.06] md:w-[48%] xl:w-[52%]">
            <ArtifactPanel artifact={artifact} onClose={() => setArtifact(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
