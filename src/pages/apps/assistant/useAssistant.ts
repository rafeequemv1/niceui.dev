import { useCallback, useEffect, useRef, useState } from 'react';
import { models, seedConversations } from './data';
import { runScenario, type ScenarioCtx } from './scenarios';
import type { AssistantMessage, Attachment, Conversation, Message, Mode, ModelId, Part } from './types';

class Cancelled extends Error {}

type Token = { cancelled: boolean };

const uid = () => crypto.randomUUID();

const titleFrom = (text: string) => {
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length > 38 ? `${t.slice(0, 38).trim()}…` : t || 'New chat';
};

export function useAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>(() => seedConversations(Date.now()));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modelId, setModelId] = useState<ModelId>('sonnet');
  const [extended, setExtended] = useState(true);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const token = useRef<Token | null>(null);

  useEffect(() => () => { if (token.current) token.current.cancelled = true; }, []);

  const model = models.find((m) => m.id === modelId) ?? models[1];
  const active = conversations.find((c) => c.id === activeId) ?? null;

  const updateConv = useCallback((id: string, fn: (c: Conversation) => Conversation) => {
    setConversations((list) => list.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const patchMsg = useCallback(
    (convId: string, msgId: string, fn: (m: AssistantMessage) => AssistantMessage) => {
      updateConv(convId, (c) => ({ ...c, messages: c.messages.map((m) => (m.id === msgId && m.role === 'assistant' ? fn(m) : m)) }));
    },
    [updateConv],
  );

  const run = useCallback(
    async (convId: string, history: Message[], user: Extract<Message, { role: 'user' }>, mode: Mode, retry = false) => {
      if (token.current) token.current.cancelled = true;
      const tk: Token = { cancelled: false };
      token.current = tk;
      const msgId = uid();
      const speed = model.speed;
      const assistant: AssistantMessage = { id: msgId, role: 'assistant', parts: [], status: 'streaming', model: model.name };
      updateConv(convId, (c) => ({ ...c, updatedAt: Date.now(), messages: [...history, user, assistant] }));
      setStreamingId(msgId);

      let count = 0;
      const sleep = (ms: number) =>
        new Promise<void>((resolve, reject) => {
          window.setTimeout(() => (tk.cancelled ? reject(new Cancelled()) : resolve()), ms / speed);
        });
      const append = (part: Part) => {
        const index = count++;
        patchMsg(convId, msgId, (m) => ({ ...m, parts: [...m.parts, part] }));
        return index;
      };
      const setPart = (index: number, fn: (p: Part) => Part) =>
        patchMsg(convId, msgId, (m) => ({ ...m, parts: m.parts.map((p, i) => (i === index ? fn(p) : p)) }));

      const typeInto = async (index: number, length: number, step: number) => {
        for (let shown = 0; shown < length; ) {
          await sleep(16);
          shown = Math.min(length, shown + step + Math.floor(Math.random() * step));
          const s = shown;
          setPart(index, (p) => ('shown' in p ? { ...p, shown: s } : p));
        }
      };

      const ctx: ScenarioCtx = {
        async think(text, seconds) {
          const i = append({ type: 'thinking', text, shown: 0, seconds, done: false });
          await sleep(300);
          await typeInto(i, text.length, 4);
          await sleep(seconds * 250);
          setPart(i, (p) => (p.type === 'thinking' ? { ...p, done: true } : p));
        },
        async tool(name, label, detail, ms, sources) {
          const i = append({ type: 'tool', name, label, detail, done: false });
          await sleep(ms);
          setPart(i, (p) => (p.type === 'tool' ? { ...p, done: true, sources } : p));
          await sleep(200);
        },
        async stream(text) {
          const i = append({ type: 'text', text, shown: 0 });
          await typeInto(i, text.length, 3);
        },
        async artifact(artifact) {
          const i = append({ type: 'artifact', artifact, done: false });
          await sleep(2200);
          setPart(i, (p) => (p.type === 'artifact' ? { ...p, done: true } : p));
        },
        async image(prompt, urls, aspect) {
          const i = append({ type: 'image', prompt, urls, progress: 0, aspect });
          for (let p = 0; p < 100; ) {
            await sleep(90);
            p = Math.min(100, p + 2 + Math.random() * 4);
            const v = p;
            setPart(i, (x) => (x.type === 'image' ? { ...x, progress: v } : x));
          }
        },
        async video(prompt, poster, seconds) {
          const i = append({ type: 'video', prompt, poster, progress: 0, seconds });
          for (let p = 0; p < 100; ) {
            await sleep(120);
            p = Math.min(100, p + 1 + Math.random() * 3);
            const v = p;
            setPart(i, (x) => (x.type === 'video' ? { ...x, progress: v } : x));
          }
        },
        async fail(message) {
          await sleep(900);
          append({ type: 'error', message });
          throw new Error(message);
        },
      };

      const finish = (status: AssistantMessage['status']) => {
        patchMsg(convId, msgId, (m) => ({ ...m, status }));
        if (token.current === tk) {
          token.current = null;
          setStreamingId(null);
        }
      };

      try {
        await sleep(450);
        await runScenario(ctx, { text: user.text, attachments: user.attachments, thinking: model.thinks && extended, retry }, mode);
        finish('done');
      } catch (e) {
        finish(e instanceof Cancelled ? 'stopped' : 'error');
      }
    },
    [extended, model, patchMsg, updateConv],
  );

  const send = useCallback(
    (text: string, attachments: Attachment[], mode: Mode) => {
      const user = { id: uid(), role: 'user' as const, text, attachments };
      if (active) {
        if (active.messages.length === 0) updateConv(active.id, (c) => ({ ...c, title: titleFrom(text) }));
        void run(active.id, active.messages, user, mode);
        return;
      }
      const conv: Conversation = { id: uid(), title: titleFrom(text), updatedAt: Date.now(), messages: [] };
      setConversations((list) => [conv, ...list]);
      setActiveId(conv.id);
      void run(conv.id, [], user, mode);
    },
    [active, run, updateConv],
  );

  const stop = useCallback(() => {
    if (token.current) token.current.cancelled = true;
  }, []);

  const regenerate = useCallback(
    (assistantId: string) => {
      if (!active) return;
      const idx = active.messages.findIndex((m) => m.id === assistantId);
      const user = active.messages[idx - 1];
      if (idx < 1 || user.role !== 'user') return;
      const failed = active.messages[idx].role === 'assistant' && (active.messages[idx] as AssistantMessage).status === 'error';
      void run(active.id, active.messages.slice(0, idx - 1), user, 'auto', failed);
    },
    [active, run],
  );

  const editMessage = useCallback(
    (userId: string, text: string) => {
      if (!active) return;
      const idx = active.messages.findIndex((m) => m.id === userId);
      const original = active.messages[idx];
      if (idx < 0 || original.role !== 'user') return;
      void run(active.id, active.messages.slice(0, idx), { ...original, text }, 'auto');
    },
    [active, run],
  );

  const rate = useCallback(
    (msgId: string, rating: 'up' | 'down') => {
      if (!active) return;
      patchMsg(active.id, msgId, (m) => ({ ...m, rating: m.rating === rating ? undefined : rating }));
    },
    [active, patchMsg],
  );

  const deleteChat = useCallback(
    (id: string) => {
      setConversations((list) => list.filter((c) => c.id !== id));
      if (activeId === id) {
        stop();
        setActiveId(null);
      }
    },
    [activeId, stop],
  );

  const renameChat = useCallback((id: string, title: string) => updateConv(id, (c) => ({ ...c, title: title.trim() || c.title })), [updateConv]);
  const togglePin = useCallback((id: string) => updateConv(id, (c) => ({ ...c, pinned: !c.pinned })), [updateConv]);

  return {
    conversations, active, activeId, setActiveId,
    model, setModelId, extended, setExtended,
    streamingId, isStreaming: streamingId !== null,
    send, stop, regenerate, editMessage, rate, deleteChat, renameChat, togglePin,
  };
}

export type AssistantApi = ReturnType<typeof useAssistant>;
