import type { DocEntry } from '@/docs/types';
import { PushToTalkDemo } from '@/components/ai/io/PushToTalk';
import { VoiceConversationDemo } from '@/components/ai/io/VoiceConversation';
import { AttachmentDropzoneDemo } from '@/components/ai/io/AttachmentDropzone';
import { AudioRecorderDemo } from '@/components/ai/io/AudioRecorder';
import { DoneToastDemo } from '@/components/ai/io/DoneToast';
import { TaskDockDemo } from '@/components/ai/io/TaskDock';
import { RunHistoryDemo } from '@/components/ai/io/RunHistory';

export const ioEntries: DocEntry[] = [
  {
    slug: 'push-to-talk',
    name: 'Push to Talk',
    description: 'Hold the mic or Space to talk, with a live waveform, timer and slide-to-cancel, while the transcript streams into the composer.',
    badge: 'New',
    demos: [
      {
        title: 'Hold to talk',
        description: 'Hold the button (or focus it and hold Space). Slide left to cancel.',
        component: PushToTalkDemo,
        height: 320,
        code: `import { PushToTalk } from '@/components/ai/io/PushToTalk';

<PushToTalk onTranscript={(text) => setDraft(text)} />`,
      },
    ],
    props: [
      { name: 'onTranscript', type: '(text: string) => void', description: 'Called with the final transcript when you release.' },
      { name: 'autoPlay', type: 'boolean', default: 'false', description: 'Records a short demo take on mount.' },
    ],
  },
  {
    slug: 'voice-conversation',
    name: 'Voice Conversation',
    description: 'Realtime voice mode with an orb, live captions for both sides, interrupt, mute, end call and a latency badge.',
    badge: 'New',
    demos: [
      {
        title: 'Live call',
        description: 'Captions stream as each side talks. Interrupt the assistant mid-sentence.',
        component: VoiceConversationDemo,
        height: 620,
        code: `import { VoiceConversation } from '@/components/ai/io/VoiceConversation';

<VoiceConversation />`,
      },
    ],
    props: [{ name: 'className', type: 'string', description: 'Extra classes for the card.' }],
  },
  {
    slug: 'attachment-dropzone',
    name: 'Attachments',
    description: 'A composer that takes files by drag and drop, paste or picker, with upload progress, image thumbnails and page or row counts.',
    badge: 'New',
    demos: [
      {
        title: 'Drop, paste or attach',
        description: 'Drag a file onto the composer, paste an image, or add a sample.',
        component: AttachmentDropzoneDemo,
        height: 340,
        code: `import { AttachmentDropzone } from '@/components/ai/io/AttachmentDropzone';

<AttachmentDropzone initial={0} />`,
      },
    ],
    props: [{ name: 'initial', type: 'number', default: '3', description: 'How many sample files to start with.' }],
  },
  {
    slug: 'audio-recorder',
    name: 'Audio Note',
    description: 'Record a voice note, scrub it on a waveform with mouse, touch or arrow keys, then send or re-record.',
    badge: 'New',
    demos: [
      {
        title: 'Voice note',
        description: 'Play, scrub, re-record or send.',
        component: AudioRecorderDemo,
        height: 300,
        code: `import { AudioRecorder } from '@/components/ai/io/AudioRecorder';

<AudioRecorder maxSeconds={120} onSend={(seconds) => upload(seconds)} />`,
      },
    ],
    props: [
      { name: 'maxSeconds', type: 'number', default: '60', description: 'Recording stops automatically at this length.' },
      { name: 'onSend', type: '(seconds: number) => void', description: 'Called when the note is sent.' },
    ],
  },
  {
    slug: 'done-toast',
    name: 'Task Done Toast',
    description: 'Toasts that announce finished agent runs, with a progress state that turns into success in place, plus open and undo.',
    badge: 'New',
    demos: [
      {
        title: 'Finished runs',
        description: 'Each toast works, then lands on a summary with Open and Undo.',
        component: DoneToastDemo,
        height: 420,
        code: `import { DoneToastStack } from '@/components/ai/io/DoneToast';

<DoneToastStack />`,
      },
    ],
    props: [{ name: 'className', type: 'string', description: 'Extra classes for the stack.' }],
  },
  {
    slug: 'task-dock',
    name: 'Background Task Dock',
    description: 'A downloads-tray style dock for background agents: progress rings, the current step, expandable details, cancel and a completed list.',
    badge: 'New',
    demos: [
      {
        title: 'Agents working',
        description: 'Expand a task to see its steps. Cancel one, or clear finished tasks.',
        component: TaskDockDemo,
        height: 480,
        code: `import { TaskDock } from '@/components/ai/io/TaskDock';

<TaskDock />`,
      },
    ],
    props: [{ name: 'className', type: 'string', description: 'Extra classes for the dock.' }],
  },
  {
    slug: 'run-history',
    name: 'Run History',
    description: 'Past agent runs with status, duration, tokens and cost, a seven-day spend sparkline, status filters and per-step timings.',
    badge: 'New',
    demos: [
      {
        title: 'Recent runs',
        description: 'Filter by status and open a run to see where the time went.',
        component: RunHistoryDemo,
        height: 560,
        code: `import { RunHistory } from '@/components/ai/io/RunHistory';

<RunHistory runs={runs} />`,
      },
    ],
    props: [{ name: 'runs', type: 'Run[]', description: 'Runs to list. Defaults to sample data.' }],
  },
];
