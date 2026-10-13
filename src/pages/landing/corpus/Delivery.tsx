import { useState } from 'react';
import { Box, Cloud, Container as ContainerIcon, Database, HardDrive, Server, Snowflake, Terminal } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Reveal } from '@/pages/landing/shared/motion';
import { Container, CopyButton, Panel, SectionHeading } from './ui';

const SNIPPETS = {
  Python: `import os, corpus

client = corpus.Client(api_key=os.environ["CORPUS_KEY"])
ds = client.datasets.get("polyglot-web-v4", version="4.2")

for batch in ds.stream(split="train", batch_size=1024,
                       filters={"lang": ["en", "ja"], "quality": ">0.9"}):
    trainer.step(batch)

ds.receipts.export("audit/receipts.parquet")`,
  cURL: `curl https://api.corpus.ai/v1/datasets/polyglot-web-v4/export \\
  -H "Authorization: Bearer $CORPUS_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "format": "parquet",
    "shard_size_mb": 512,
    "destination": "s3://lab-bucket/corpus/"
  }'`,
  S3: `# Delivered via cross-account role, no keys exchanged
aws s3 ls s3://corpus-deliveries/acme-labs/polyglot-web-v4/

  PRE  train/
  PRE  validation/
       manifest.json        # sha256 per shard, signed
       receipts.parquet     # one license receipt per record`,
} as const;

type Lang = keyof typeof SNIPPETS;

function highlight(line: string, lang: Lang) {
  if (line.trimStart().startsWith('#')) return <span className="text-zinc-500">{line}</span>;
  const parts = line.split(/("[^"]*"|'[^']*'|\b(?:import|for|in|curl|aws)\b|\s-[HdX]\s|#.*$)/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (p.startsWith('#')) return <span key={i} className="text-zinc-500">{p}</span>;
    if (/^["']/.test(p)) return <span key={i} className="text-teal-200">{p}</span>;
    if (/^(import|for|in|curl|aws)$/.test(p)) return <span key={i} className="text-amber-200">{p}</span>;
    if (/^\s-[HdX]\s$/.test(p)) return <span key={i} className="text-emerald-300">{p}</span>;
    return <span key={i} className={lang === 'S3' ? 'text-zinc-300' : 'text-zinc-200'}>{p}</span>;
  });
}

const DESTS = [
  { name: 'Amazon S3', icon: Cloud },
  { name: 'Google Cloud Storage', icon: HardDrive },
  { name: 'Azure Blob', icon: Box },
  { name: 'Snowflake', icon: Snowflake },
  { name: 'Databricks', icon: Database },
  { name: 'Hugging Face (private)', icon: ContainerIcon },
  { name: 'On-prem / air-gapped', icon: Server },
  { name: 'Streaming API', icon: Terminal },
];

export function CorpusDelivery() {
  const [lang, setLang] = useState<Lang>('Python');
  const code = SNIPPETS[lang];
  return (
    <section id="delivery" className="relative scroll-mt-20 border-t border-white/[0.06] py-24 sm:py-32">
      <Container className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center">
        <Reveal>
          <SectionHeading eyebrow="05 — Delivery" title={<>From contract to <em className="italic text-teal-100">dataloader</em> in an afternoon.</>} sub="Stream directly into training, export sharded Parquet or WebDataset, or receive a signed drop in your own bucket." />
          <div className="mt-10 grid grid-cols-2 gap-2">
            {DESTS.map(({ name, icon: Icon }) => (
              <div key={name} className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-300 transition hover:border-teal-300/30 hover:text-white">
                <Icon className="h-4 w-4 shrink-0 text-zinc-500 transition-colors group-hover:text-teal-200" strokeWidth={1.5} />
                <span className="truncate">{name}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <Panel>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
              <div className="flex gap-1">
                {(Object.keys(SNIPPETS) as Lang[]).map((l) => (
                  <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded-md px-3 py-1.5 font-mono text-xs transition-colors', lang === l ? 'bg-white/[0.08] text-white' : 'text-zinc-400 hover:text-white')}>
                    {l}
                  </button>
                ))}
              </div>
              <CopyButton text={code} />
            </div>
            <pre key={lang} className="min-h-[300px] animate-fade-in overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75]">
              {code.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="mr-5 w-5 shrink-0 select-none text-right text-zinc-600">{i + 1}</span>
                  <span className="whitespace-pre">{highlight(line, lang)}</span>
                </div>
              ))}
            </pre>
          </Panel>
        </Reveal>
      </Container>
    </section>
  );
}
