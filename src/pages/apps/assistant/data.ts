import type { Artifact, Conversation, Model, Source } from './types';

export const models: Model[] = [
  { id: 'opus', name: 'Nova 4 Opus', blurb: 'Deepest reasoning for complex work', speed: 0.75, thinks: true },
  { id: 'sonnet', name: 'Nova 4 Sonnet', blurb: 'Smart, fast, great for everyday tasks', speed: 1, thinks: true },
  { id: 'haiku', name: 'Nova 4 Haiku', blurb: 'Fastest answers, no extended thinking', speed: 1.8, thinks: false },
];

const px = (id: number) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940`;

export const imageSets = {
  city: [px(36652168), px(12431908), px(37952462), px(37952458)],
  nature: [px(6102918), px(2437293), px(11747524), px(6102922)],
};

export const videoPosters = [px(30750101), px(1421264), px(19704701)];

export const searchSources: Source[] = [
  { title: 'The state of AI interfaces in 2026', domain: 'research.niceui.dev', snippet: 'Agentic interfaces now account for most new product launches, with streaming and tool transparency as baseline expectations.' },
  { title: 'Designing trust into AI products', domain: 'uxcollective.io', snippet: 'Showing sources, intermediate steps and clear stop controls measurably increases user trust and retention.' },
  { title: 'Latency budgets for conversational UI', domain: 'web.dev', snippet: 'First token under 400ms feels instant; perceived speed matters more than total completion time.' },
  { title: 'Multimodal generation benchmarks', domain: 'arxiv.org', snippet: 'Image and short-form video generation quality improved roughly 3x on human preference evals year over year.' },
];

const pricingHtml = `<!doctype html>
<html><head><style>
  *{box-sizing:border-box;margin:0;font-family:ui-sans-serif,system-ui}
  body{min-height:100vh;display:grid;place-items:center;background:#0b0d12;color:#e7e9ee;padding:24px}
  .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;width:100%;max-width:680px}
  .card{background:#13161d;border:1px solid #232733;border-radius:18px;padding:22px;transition:.3s}
  .card:hover{transform:translateY(-4px);border-color:#38bdf8}
  .pro{background:linear-gradient(160deg,#1a2a44,#13161d);border-color:#38bdf8}
  h3{font-size:14px;color:#9aa3b2;font-weight:500}
  .price{font-size:36px;font-weight:600;margin:10px 0 4px}
  .price span{font-size:13px;color:#6b7383}
  ul{list-style:none;padding:0;margin:16px 0;display:grid;gap:8px;font-size:13px;color:#b8bfcc}
  li:before{content:"✓ ";color:#34d399}
  button{width:100%;padding:11px;border-radius:10px;border:0;font-weight:600;cursor:pointer;background:#232733;color:#fff}
  .pro button{background:#38bdf8}
</style></head><body>
  <div class="grid">
    <div class="card"><h3>Starter</h3><div class="price">$0<span>/mo</span></div><ul><li>3 projects</li><li>Community support</li></ul><button>Get started</button></div>
    <div class="card pro"><h3>Pro</h3><div class="price">$24<span>/mo</span></div><ul><li>Unlimited projects</li><li>Priority support</li><li>Custom domains</li></ul><button>Upgrade</button></div>
    <div class="card"><h3>Team</h3><div class="price">$79<span>/mo</span></div><ul><li>Everything in Pro</li><li>SSO & audit logs</li></ul><button>Contact sales</button></div>
  </div>
</body></html>`;

const timerHtml = `<!doctype html>
<html><head><style>
  *{box-sizing:border-box;margin:0;font-family:ui-sans-serif,system-ui}
  body{min-height:100vh;display:grid;place-items:center;background:radial-gradient(circle at 50% 30%,#13233b,#0b0d12);color:#fff}
  .wrap{text-align:center}
  svg{transform:rotate(-90deg)}
  .time{position:absolute;inset:0;display:grid;place-items:center;font-size:44px;font-weight:600;font-variant-numeric:tabular-nums}
  .ring{position:relative;width:220px;height:220px;margin:0 auto}
  .row{display:flex;gap:10px;justify-content:center;margin-top:28px}
  button{padding:10px 20px;border-radius:999px;border:1px solid #2b3445;background:#151b26;color:#fff;font-weight:600;cursor:pointer}
  button.primary{background:#38bdf8;border-color:#38bdf8}
  .label{margin-top:14px;color:#8a94a6;font-size:13px;letter-spacing:.15em;text-transform:uppercase}
</style></head><body>
  <div class="wrap">
    <div class="ring">
      <svg width="220" height="220"><circle cx="110" cy="110" r="96" stroke="#1f2633" stroke-width="10" fill="none"/>
      <circle id="arc" cx="110" cy="110" r="96" stroke="#38bdf8" stroke-width="10" fill="none" stroke-linecap="round" stroke-dasharray="603" stroke-dashoffset="0"/></svg>
      <div class="time" id="t">25:00</div>
    </div>
    <div class="label" id="l">Focus</div>
    <div class="row"><button class="primary" id="go">Start</button><button id="reset">Reset</button></div>
  </div>
<script>
  let total=25*60,left=total,timer=null;
  const t=document.getElementById('t'),arc=document.getElementById('arc'),go=document.getElementById('go');
  const draw=()=>{t.textContent=String(Math.floor(left/60)).padStart(2,'0')+':'+String(left%60).padStart(2,'0');arc.style.strokeDashoffset=603*(1-left/total)};
  go.onclick=()=>{if(timer){clearInterval(timer);timer=null;go.textContent='Start';return}
    go.textContent='Pause';timer=setInterval(()=>{left=Math.max(0,left-1);draw();if(!left){clearInterval(timer);timer=null;go.textContent='Start'}},1000)};
  document.getElementById('reset').onclick=()=>{clearInterval(timer);timer=null;left=total;go.textContent='Start';draw()};
  draw();
</script>
</body></html>`;

export const artifacts: Record<'pricing' | 'timer', Artifact> = {
  pricing: { id: 'pricing', title: 'Pricing table', language: 'html', code: pricingHtml },
  timer: { id: 'timer', title: 'Pomodoro timer', language: 'html', code: timerHtml },
};

export const suggestions = [
  { label: 'Build a pomodoro timer app', prompt: 'Build me a pomodoro timer app with a progress ring', tag: 'Code' },
  { label: 'Generate a neon city image', prompt: 'Generate an image of a rainy neon city street at night, cinematic', tag: 'Image' },
  { label: 'Create a drone video of a coast', prompt: 'Create a video: slow aerial drone shot over a turquoise coastline', tag: 'Video' },
  { label: 'Research AI interface trends', prompt: 'Search the latest research on AI interface design trends in 2026', tag: 'Search' },
  { label: 'Explain a concept simply', prompt: 'Explain how transformers work like I am a product designer', tag: 'Write' },
  { label: 'Simulate a failed request', prompt: 'Trigger an error so I can see the failure state', tag: 'Error' },
];

const hour = 3_600_000;
const day = 24 * hour;

function textChat(id: string, title: string, updatedAt: number, q: string, a: string): Conversation {
  return {
    id, title, updatedAt,
    messages: [
      { id: `${id}u`, role: 'user', text: q, attachments: [] },
      { id: `${id}a`, role: 'assistant', status: 'done', model: 'Nova 4 Sonnet', parts: [{ type: 'text', text: a, shown: a.length }] },
    ],
  };
}

export function seedConversations(now: number): Conversation[] {
  return [
    {
      id: 'seed-1',
      title: 'Misty lake concept art',
      updatedAt: now - 2 * hour,
      pinned: true,
      messages: [
        { id: 's1u', role: 'user', text: 'Generate a misty mountain lake at sunrise, calm and painterly', attachments: [] },
        {
          id: 's1a', role: 'assistant', status: 'done', model: 'Nova 4 Sonnet',
          parts: [
            { type: 'text', text: 'Here are four takes on a calm, misty sunrise over an alpine lake.', shown: 999 },
            { type: 'image', prompt: 'Misty mountain lake at sunrise, painterly, soft light', urls: imageSets.nature, progress: 100, aspect: 'square' },
          ],
        },
      ],
    },
    {
      id: 'seed-2',
      title: 'Pricing table component',
      updatedAt: now - 1.2 * day,
      messages: [
        { id: 's2u', role: 'user', text: 'Make me a dark pricing table with three tiers', attachments: [] },
        {
          id: 's2a', role: 'assistant', status: 'done', model: 'Nova 4 Opus',
          parts: [
            { type: 'text', text: 'Here is a responsive three-tier pricing table. The **Pro** tier is highlighted and every card lifts on hover.', shown: 999 },
            { type: 'artifact', artifact: artifacts.pricing, done: true },
          ],
        },
      ],
    },
    textChat('seed-3', 'Q3 board update outline', now - 3 * day, 'Outline a Q3 board update for a seed-stage startup',
      '## Q3 board update\n1. **Headline metrics:** ARR, burn, runway and net retention.\n2. **Wins:** two enterprise logos and the self-serve launch.\n3. **Misses:** hiring is six weeks behind plan.\n4. **Asks:** intros to two design partners in fintech.\nKeep it to one page and send it 48 hours ahead.'),
    textChat('seed-4', 'Onboarding email sequence', now - 5 * day, 'Draft a 3-email onboarding sequence',
      '## Day 0: Welcome\nA warm hello and **one** action: create your first project.\n## Day 2: Quick win\nShow a 60-second template that delivers value immediately.\n## Day 5: Social proof\nA short customer story and an invite to a live onboarding call.'),
    textChat('seed-5', 'Trip plan: Lisbon in 4 days', now - 12 * day, 'Plan 4 days in Lisbon for a design lover',
      '## Day 1: Alfama & Graça\n- Miradouro da Graça at sunset\n## Day 2: Belém\n- MAAT and the Tile Museum\n## Day 3: Sintra day trip\n- Pena Palace, early to beat the crowds\n## Day 4: LX Factory\n- Bookshops, studios and a long lunch'),
  ];
}
