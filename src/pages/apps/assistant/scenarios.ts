import { artifacts, imageSets, searchSources, videoPosters } from './data';
import type { Artifact, Attachment, Mode, Source } from './types';

export type ScenarioCtx = {
  think: (text: string, seconds: number) => Promise<void>;
  tool: (name: string, label: string, detail: string, ms: number, sources?: Source[]) => Promise<void>;
  stream: (text: string) => Promise<void>;
  artifact: (a: Artifact) => Promise<void>;
  image: (prompt: string, urls: string[], aspect: 'square' | 'wide') => Promise<void>;
  video: (prompt: string, poster: string, seconds: number) => Promise<void>;
  fail: (message: string) => Promise<void>;
};

export type ScenarioInput = { text: string; attachments: Attachment[]; thinking: boolean; retry: boolean };

type ScenarioId = 'text' | 'search' | 'code' | 'image' | 'video' | 'files' | 'error';

export function pickScenario(text: string, mode: Mode, hasFiles: boolean): ScenarioId {
  if (mode !== 'auto') return mode;
  const t = text.toLowerCase();
  if (/\b(error|fail|break|crash)\b/.test(t)) return 'error';
  if (hasFiles) return 'files';
  if (/\b(video|clip|animate|film|footage|drone)\b/.test(t)) return 'video';
  if (/\b(image|picture|photo|draw|illustrat|render|art|logo|poster)\w*/.test(t)) return 'image';
  if (/\b(code|component|html|app|build|function|script|timer|pricing|website|ui)\b/.test(t)) return 'code';
  if (/\b(search|latest|news|research|today|current|trend|2026|sources?)\b/.test(t)) return 'search';
  return 'text';
}

const quoted = (s: string) => (s.length > 64 ? `${s.slice(0, 64).trim()}…` : s);

const scripts: Record<ScenarioId, (ctx: ScenarioCtx, input: ScenarioInput) => Promise<void>> = {
  async text(ctx, { text, thinking, retry }) {
    if (thinking) {
      await ctx.think(
        `The user wants a clear explanation of "${quoted(text)}". I should open with a one-line intuition, then build up in layers, use an analogy that fits their background, and finish with something they can act on. Keep it skimmable with short sections.`,
        3,
      );
    }
    await ctx.stream(
      `${retry ? 'Connection restored, here is the full answer.\n' : ''}## The short version\nThink of it as a **very attentive reader**. Every word looks at every other word and decides how much each one matters for understanding it.\n## How it works\n1. Text is split into small pieces called **tokens**.\n2. Each token asks the others "how relevant are you to me?", a step called **attention**.\n3. Those relevance scores blend information across the whole sentence, layer after layer.\n4. The final layer predicts the most likely next token, and the loop repeats.\n## Why designers should care\n- Context is everything: the clearer your prompt, the better the attention has to work with.\n- Streaming exists because the model genuinely produces one token at a time.\n- Long inputs cost more because every token attends to every other token.\nWant me to turn this into a one-page visual explainer?`,
    );
  },

  async search(ctx, { text, thinking }) {
    if (thinking) await ctx.think(`I need recent, credible sources for "${quoted(text)}". I'll search broadly, then narrow to research and practitioner writing, and synthesize the key trends with citations.`, 2);
    await ctx.tool('web_search', 'Searching the web', quoted(text), 1600, searchSources.slice(0, 2));
    await ctx.tool('web_search', 'Reading 4 sources', 'AI interface design research 2026', 1400, searchSources);
    await ctx.stream(
      `## What changed this year\n- **Agents became the default.** Most new launches are agentic, so showing intermediate steps is now table stakes [1].\n- **Transparency builds trust.** Products that expose sources and offer a clear stop control see higher retention [2].\n- **Perceived speed wins.** A first token under 400ms feels instant, even when the full answer takes longer [3].\n- **Multimodal is mainstream.** Image and short video quality roughly tripled on preference evals [4].\n## What it means for your product\nDesign for visible progress: thinking states, tool cards and citations, exactly like this answer.`,
    );
  },

  async code(ctx, { text, thinking }) {
    const a = /timer|pomodoro|clock|countdown/i.test(text) ? artifacts.timer : artifacts.pricing;
    if (thinking) await ctx.think(`Plan: a single self-contained HTML file so it previews instantly. Dark theme, accessible contrast, clear states. For "${quoted(text)}" I'll keep the logic small and readable and avoid external dependencies.`, 3);
    await ctx.stream(`I built a self-contained **${a.title.toLowerCase()}**. It runs as a single file with no dependencies, so you can preview it live on the right or copy the code straight into your project.`);
    await ctx.artifact(a);
    await ctx.stream(`\n## What's included\n- Fully responsive layout with hover and focus states\n- Accessible color contrast on a dark surface\n- Zero external dependencies\nAsk me to change colors, add states or convert it to React.`);
  },

  async image(ctx, { text, thinking }) {
    const urls = /city|neon|street|urban|night/i.test(text) ? imageSets.city : imageSets.nature;
    if (thinking) await ctx.think(`Translating "${quoted(text)}" into a detailed visual prompt: subject, lighting, lens, mood and composition. I'll generate four variations with slightly different framing.`, 2);
    await ctx.stream('Generating four variations for you now.');
    await ctx.image(text, urls, 'square');
    await ctx.stream('\nHover any image to download, upscale or create variations. Click to open it full size.');
  },

  async video(ctx, { text, thinking }) {
    if (thinking) await ctx.think(`Storyboarding "${quoted(text)}": one continuous 6-second shot, slow forward dolly, golden-hour grade, 24fps for a cinematic feel.`, 2);
    await ctx.tool('storyboard', 'Writing storyboard', '1 shot · 6s · 24fps · 16:9', 1200);
    await ctx.stream('Rendering your clip. Video takes a little longer than images.');
    await ctx.video(text, videoPosters[Math.floor(Math.random() * videoPosters.length)], 6);
    await ctx.stream('\nYour 6-second clip is ready. Press play to preview, or ask me to extend it or change the camera move.');
  },

  async files(ctx, { attachments, thinking }) {
    const names = attachments.map((a) => a.name).join(', ');
    await ctx.tool('read_files', `Reading ${attachments.length} file${attachments.length > 1 ? 's' : ''}`, quoted(names), 1500);
    if (thinking) await ctx.think('Scanning structure first, then pulling out the key facts, numbers and open questions. I will summarize, then suggest next steps.', 2);
    await ctx.stream(
      `## Summary of ${attachments.length > 1 ? 'your files' : `**${attachments[0].name}**`}\n- The document is well structured and easy to follow.\n- Three themes stand out: **timelines**, **budget** and **ownership**.\n- Two sections reference figures that are not sourced, worth double-checking.\n## Suggested next steps\n1. Add owners to every open item.\n2. Move the budget table up front.\n3. Cut the appendix by half.\nWant me to rewrite any section?`,
    );
  },

  async error(ctx, input) {
    if (input.retry) return scripts.text(ctx, input);
    await ctx.stream('Let me look into that');
    await ctx.fail('The connection was interrupted while generating this response. Nothing was lost, and you can retry.');
  },
};

export function runScenario(ctx: ScenarioCtx, input: ScenarioInput, mode: Mode) {
  const id = pickScenario(input.text, mode, input.attachments.length > 0);
  return scripts[id](ctx, input);
}
