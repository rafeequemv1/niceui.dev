export type Modality = 'Text' | 'Code' | 'Image' | 'Audio' | 'Video' | 'RLHF' | 'Eval';

export type Dataset = {
  id: string;
  name: string;
  modality: Modality;
  size: string;
  records: string;
  license: 'Commercial' | 'Research';
  languages: string;
  freshness: string;
  quality: number;
  spark: number[];
  description: string;
  schema: [string, string, string][];
  sample: Record<string, unknown>;
  price: string;
};

const s = (seed: number) => Array.from({ length: 14 }, (_, i) => 30 + Math.round(40 * Math.abs(Math.sin(seed + i * 0.7)) + i * 2));

export const DATASETS: Dataset[] = [
  {
    id: 'polyglot-web-v4', name: 'Polyglot Web v4', modality: 'Text', size: '1.8T tokens', records: '2.4B docs', license: 'Commercial', languages: '212 languages', freshness: 'Updated 3d ago', quality: 96, spark: s(1),
    description: 'Licensed long-form web text with publisher agreements, deduplicated at the paragraph level and scored for quality and toxicity.',
    schema: [['id', 'string', 'Stable record id'], ['text', 'string', 'Normalized UTF-8 body'], ['lang', 'iso639-3', 'Detected language'], ['quality', 'float', '0–1 classifier score'], ['receipt', 'string', 'License receipt id']],
    sample: { id: 'pw4-88120931', lang: 'por', quality: 0.94, text: 'A fotossíntese converte energia luminosa em energia química…', receipt: 'rcpt_4b1e' },
    price: 'from $0.40 / 1M tokens',
  },
  {
    id: 'stackline-code', name: 'Stackline Code', modality: 'Code', size: '640B tokens', records: '310M files', license: 'Commercial', languages: '61 languages', freshness: 'Updated 1w ago', quality: 94, spark: s(2),
    description: 'Permissively licensed repositories with SPDX-verified licenses, commit history, test outcomes and execution traces.',
    schema: [['repo', 'string', 'Origin repository'], ['path', 'string', 'File path'], ['content', 'string', 'Source code'], ['spdx', 'string', 'Verified license'], ['tests_pass', 'bool', 'CI outcome']],
    sample: { repo: 'acme/tensor-utils', path: 'src/ops.rs', spdx: 'Apache-2.0', tests_pass: true, content: 'pub fn softmax(x: &[f32]) -> Vec<f32> { … }' },
    price: 'from $0.85 / 1M tokens',
  },
  {
    id: 'lumen-captions', name: 'Lumen Captions', modality: 'Image', size: '120M images', records: '120M pairs', license: 'Commercial', languages: '34 languages', freshness: 'Updated 2w ago', quality: 97, spark: s(3),
    description: 'Photographer-licensed images with dense human captions, region boxes and aesthetic ratings. Model releases on file.',
    schema: [['image_uri', 'uri', 'Signed S3 object'], ['caption', 'string', 'Dense caption'], ['regions', 'bbox[]', 'Labeled regions'], ['aesthetic', 'float', '1–10 rating'], ['release', 'string', 'Model release id']],
    sample: { image_uri: 's3://corpus/lumen/0x91f2.jpg', caption: 'Aerial view of commuters crossing a striped intersection at noon', regions: 14, aesthetic: 7.8 },
    price: 'from $0.012 / image',
  },
  {
    id: 'chorus-speech', name: 'Chorus Speech', modality: 'Audio', size: '1.2M hours', records: '84M utterances', license: 'Commercial', languages: '94 locales', freshness: 'Updated 5d ago', quality: 95, spark: s(4),
    description: 'Consented conversational and read speech with word-level timestamps, speaker diarization and accent metadata.',
    schema: [['audio_uri', 'uri', '48kHz FLAC'], ['transcript', 'string', 'Verbatim text'], ['words', 'word[]', 'Aligned timestamps'], ['speaker', 'object', 'Demographics (opt-in)'], ['consent', 'string', 'Consent record']],
    sample: { audio_uri: 's3://corpus/chorus/es-MX/71af.flac', duration_s: 6.42, transcript: '¿Podrías revisar el informe antes del viernes?', consent: 'cns_2290' },
    price: 'from $18 / hour',
  },
  {
    id: 'motion-atlas', name: 'Motion Atlas', modality: 'Video', size: '410K hours', records: '22M clips', license: 'Research', languages: 'Multilingual', freshness: 'Updated 1mo ago', quality: 92, spark: s(5),
    description: 'Egocentric and third-person video with temporal action segments, camera motion labels and dense narration.',
    schema: [['clip_uri', 'uri', '1080p H.265'], ['fps', 'int', 'Frame rate'], ['actions', 'segment[]', 'Temporal labels'], ['narration', 'string', 'Time-aligned narration']],
    sample: { clip_uri: 's3://corpus/motion/ego/5512.mp4', fps: 30, actions: [{ t0: 1.2, t1: 3.8, label: 'pour water' }] },
    price: 'from $42 / hour',
  },
  {
    id: 'preference-atlas-v3', name: 'Preference Atlas v3', modality: 'RLHF', size: '14M pairs', records: '14M comparisons', license: 'Commercial', languages: '28 languages', freshness: 'Updated 2d ago', quality: 98, spark: s(6),
    description: 'Expert-ranked response pairs across reasoning, coding, safety and creative writing with written rationales.',
    schema: [['prompt', 'string', 'User turn'], ['chosen', 'string', 'Preferred response'], ['rejected', 'string', 'Dispreferred response'], ['rationale', 'string', 'Annotator explanation'], ['agreement', 'float', 'Inter-rater κ']],
    sample: { prompt: 'Explain why the sky is blue to a 7-year-old.', chosen: 'Sunlight is made of many colors…', rejected: 'Rayleigh scattering ∝ 1/λ⁴…', agreement: 0.91 },
    price: 'from $1.10 / pair',
  },
  {
    id: 'safety-dialogues', name: 'Safety Dialogues', modality: 'RLHF', size: '2.6M turns', records: '410K convos', license: 'Research', languages: '12 languages', freshness: 'Updated 1w ago', quality: 97, spark: s(7),
    description: 'Red-team conversations with policy labels, refusal quality ratings and safe-completion rewrites.',
    schema: [['dialogue', 'turn[]', 'Multi-turn conversation'], ['policy', 'string', 'Violated category'], ['rewrite', 'string', 'Safe completion']],
    sample: { policy: 'none', turns: 6, refusal_quality: 4.5, rewrite: 'Here is a safer way to approach this…' },
    price: 'from $2.40 / turn',
  },
  {
    id: 'gradient-eval', name: 'Gradient Reasoning Eval', modality: 'Eval', size: '48K items', records: '48K problems', license: 'Research', languages: 'English', freshness: 'Sealed · Q3', quality: 99, spark: s(8),
    description: 'Never-published, contamination-audited problems in math, science and multi-step reasoning written by PhDs.',
    schema: [['question', 'string', 'Problem statement'], ['answer', 'string', 'Canonical answer'], ['difficulty', 'int', '1–5'], ['canary', 'string', 'Contamination canary']],
    sample: { question: 'Let f(x)=x³−3x. Count real solutions of f(f(x))=0.', answer: '9', difficulty: 4, canary: 'cx-canary-7a1' },
    price: 'Custom, sealed access',
  },
  {
    id: 'agentic-tasks', name: 'Agentic Tasks', modality: 'Eval', size: '9.2K tasks', records: '9.2K environments', license: 'Commercial', languages: 'English', freshness: 'Updated 4d ago', quality: 96, spark: s(9),
    description: 'Containerized software and browser tasks with hidden test suites for evaluating long-horizon agents.',
    schema: [['task_id', 'string', 'Task id'], ['env', 'docker', 'Reproducible image'], ['tests', 'hidden', 'Grader suite']],
    sample: { task_id: 'agt-2219', env: 'corpus/env:py311-web', steps_median: 38, pass_at_1: 0.31 },
    price: 'from $24K / suite',
  },
  {
    id: 'scholar-full', name: 'Scholar Full-Text', modality: 'Text', size: '420B tokens', records: '61M papers', license: 'Commercial', languages: '18 languages', freshness: 'Updated 6d ago', quality: 98, spark: s(10),
    description: 'Peer-reviewed full-text articles licensed from 300+ publishers, with LaTeX math, figures and citations preserved.',
    schema: [['doi', 'string', 'Digital object id'], ['body', 'markdown', 'Full text with LaTeX'], ['citations', 'string[]', 'Resolved references']],
    sample: { doi: '10.5555/corpus.2024.118', field: 'condensed matter', tokens: 14210 },
    price: 'from $1.20 / 1M tokens',
  },
];

export const TABS: ('All' | Modality)[] = ['All', 'Text', 'Code', 'Image', 'Audio', 'Video', 'RLHF', 'Eval'];
