export type Source = { title: string; domain: string; snippet: string };

export type Attachment = { id: string; name: string; size: number; kind: 'image' | 'file'; url?: string };

export type Artifact = { id: string; title: string; language: string; code: string };

export type Part =
  | { type: 'thinking'; text: string; shown: number; seconds: number; done: boolean }
  | { type: 'tool'; name: string; label: string; detail: string; done: boolean; sources?: Source[] }
  | { type: 'text'; text: string; shown: number }
  | { type: 'artifact'; artifact: Artifact; done: boolean }
  | { type: 'image'; prompt: string; urls: string[]; progress: number; aspect: 'square' | 'wide' }
  | { type: 'video'; prompt: string; poster: string; progress: number; seconds: number }
  | { type: 'error'; message: string };

export type Message =
  | { id: string; role: 'user'; text: string; attachments: Attachment[] }
  | { id: string; role: 'assistant'; parts: Part[]; status: 'streaming' | 'done' | 'stopped' | 'error'; model: string; rating?: 'up' | 'down' };

export type AssistantMessage = Extract<Message, { role: 'assistant' }>;

export type Conversation = { id: string; title: string; updatedAt: number; pinned?: boolean; messages: Message[] };

export type Mode = 'auto' | 'search' | 'image' | 'video' | 'code';

export type ModelId = 'opus' | 'sonnet' | 'haiku';

export type Model = { id: ModelId; name: string; blurb: string; speed: number; thinks: boolean };
