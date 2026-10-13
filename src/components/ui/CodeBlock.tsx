import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/cn';

const KEYWORDS =
  /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|async|await|new|type|interface|extends|true|false|null|undefined|class|def|print)\b/;

type Token = { text: string; cls: string };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  const re =
    /(\/\/.*$|#.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*)|(\b\d+(?:\.\d+)?\b)|(\b[A-Za-z_$][\w$]*\b)|(\s+)|([^\sA-Za-z0-9_$"'`]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(line))) {
    const [text, comment, str, tag, num, word] = m;
    let cls = 'text-ink-300';
    if (comment) cls = 'text-ink-500 italic';
    else if (str) cls = 'text-emerald-300';
    else if (tag) cls = 'text-brand-300';
    else if (num) cls = 'text-amber-300';
    else if (word && KEYWORDS.test(word)) cls = 'text-rose-300';
    else if (word && /^[A-Z]/.test(word)) cls = 'text-sky-200';
    tokens.push({ text, cls });
  }
  return tokens;
}

type CodeBlockProps = {
  code: string;
  filename?: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
  maxHeight?: number;
};

export function CodeBlock({
  code,
  filename,
  language = 'tsx',
  showLineNumbers = true,
  highlightLines = [],
  className,
  maxHeight = 480,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, '').split('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={cn('group relative overflow-hidden rounded-xl bg-ink-950 shadow-hairline', className)}>
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs text-ink-400">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-700" />
          </span>
          <span className="ml-2 font-mono">{filename ?? language}</span>
        </div>
        <button
          onClick={copy}
          className="focus-ring relative flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-ink-400 transition-colors hover:bg-white/5 hover:text-ink-100"
          aria-label="Copy code"
        >
          <span className="relative h-3.5 w-3.5">
            <Copy className={cn('absolute inset-0 h-3.5 w-3.5 transition-all duration-300', copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100')} />
            <Check className={cn('absolute inset-0 h-3.5 w-3.5 text-emerald-400 transition-all duration-300 ease-spring', copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0')} />
          </span>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-auto py-3 font-mono text-[13px] leading-6" style={{ maxHeight }}>
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                'flex px-4',
                highlightLines.includes(i + 1) && 'bg-brand-500/10 shadow-[inset_2px_0_0_theme(colors.brand.400)]',
              )}
            >
              {showLineNumbers && <span className="mr-5 w-6 shrink-0 select-none text-right text-ink-600">{i + 1}</span>}
              <span className="whitespace-pre">
                {tokenize(line).map((t, j) => (
                  <span key={j} className={t.cls}>
                    {t.text}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}
