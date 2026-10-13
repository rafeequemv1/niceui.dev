import type { DocEntry } from '@/docs/types';
import { OtpInputDemo } from '@/components/blocks/OtpInput';
import { SignUpFormDemo } from '@/components/blocks/SignUpForm';
import { BloomMenuDemo } from '@/components/blocks/BloomMenu';
import { FeedbackWidgetDemo } from '@/components/blocks/FeedbackWidget';
import { NotFoundCardDemo, NotFoundPageDemo } from '@/components/blocks/NotFound';
import { PullToRefreshDemo } from '@/components/blocks/PullToRefresh';

export const formBlockEntries: DocEntry[] = [
  {
    slug: 'otp-input',
    name: 'OTP Input',
    description: 'A six-digit code input that advances automatically, supports paste and backspace, and shows verifying, success and error states.',
    demos: [
      {
        title: 'Verify email',
        description: 'Type or paste a code. 424242 succeeds; any other code shakes and clears the boxes.',
        component: OtpInputDemo,
        height: 420,
        code: `import { OtpInput, type OtpStatus } from '@/components/blocks/OtpInput';

export function Verify() {
  const [status, setStatus] = useState<OtpStatus>('idle');

  const verify = async (code: string) => {
    setStatus('verifying');
    const ok = await api.verifyCode(code);
    setStatus(ok ? 'success' : 'error');
    if (!ok) setTimeout(() => setStatus('idle'), 900);
    return ok;
  };

  return <OtpInput length={6} status={status} onComplete={verify} />;
}`,
      },
    ],
    props: [
      { name: 'length', type: 'number', default: '6', description: 'Number of digit boxes.' },
      { name: 'onComplete', type: '(code: string) => Promise<boolean>', description: 'Called once every box is filled. Return false to shake and clear.' },
      { name: 'status', type: "'idle' | 'verifying' | 'success' | 'error'", description: 'Visual state. Verifying and success lock the inputs.' },
      { name: 'disabled', type: 'boolean', default: 'false', description: 'Locks all inputs.' },
    ],
  },
  {
    slug: 'sign-up-form',
    name: 'Sign Up Form',
    description: 'A sign-up card with social buttons, inline validation, a live password strength meter and an animated success state.',
    demos: [
      {
        title: 'Create account',
        description: 'Submit while it is empty to see validation. Type a password to fill the strength meter.',
        component: SignUpFormDemo,
        height: 600,
        code: `import { SignUpForm, passwordScore } from '@/components/blocks/SignUpForm';

export function SignUpPage() {
  return (
    <SignUpForm
      onSubmit={async ({ email, password }) => {
        const { error } = await auth.signUp({ email, password });
        if (error) throw error;
      }}
    />
  );
}

// passwordScore('Nice#2024') → { score: 4, checks: [true, true, true, true] }`,
      },
    ],
    props: [
      { name: 'onSubmit', type: '(data: { email; password }) => Promise<void>', description: 'Runs after validation passes. The button shows a spinner until it resolves.' },
      { name: 'passwordScore', type: '(pw: string) => { score; checks }', description: 'Exported helper: length, mixed case, number and symbol checks.' },
    ],
  },
  {
    slug: 'bloom-menu',
    name: 'Bloom Menu',
    description: 'A floating action button that opens into a ring or arc of actions, each arriving on its own spring with a stagger.',
    demos: [
      {
        title: 'Ring and arc',
        description: 'Click a + button to open it. Escape or a click outside closes it.',
        component: BloomMenuDemo,
        height: 440,
        code: `import { BloomMenu } from '@/components/blocks/BloomMenu';

export function Composer() {
  return (
    <BloomMenu
      radius={84}
      spread={150}
      direction={-90}
      items={[
        { id: 'photo', label: 'Photo', icon: Camera, tint: 'bg-rose-500' },
        { id: 'gallery', label: 'Gallery', icon: Image, tint: 'bg-amber-500' },
        { id: 'voice', label: 'Voice note', icon: Mic, tint: 'bg-emerald-500' },
        { id: 'doc', label: 'Document', icon: FileText, tint: 'bg-sky-500' },
      ]}
      onSelect={(item) => attach(item.id)}
    />
  );
}`,
      },
    ],
    props: [
      { name: 'items', type: 'BloomItem[]', description: 'Actions with id, label, icon and background tint.' },
      { name: 'radius', type: 'number', default: '92', description: 'Distance from the button to each item, in px.' },
      { name: 'spread', type: 'number', default: '360', description: 'Arc in degrees. 360 makes a full ring.' },
      { name: 'direction', type: 'number', default: '-90', description: 'Angle the arc is centered on. −90 points up.' },
      { name: 'onSelect', type: '(item: BloomItem) => void', description: 'Called when an item is clicked. The menu then closes.' },
    ],
  },
  {
    slug: 'feedback-widget',
    name: 'Feedback Widget',
    description: 'A small pill that grows into a feedback panel with a rating and comment box, then shrinks into a thank-you card.',
    demos: [
      {
        title: 'Collect feedback',
        description: 'Open it, pick a rating, optionally write a note and send.',
        component: FeedbackWidgetDemo,
        height: 400,
        code: `import { FeedbackWidget } from '@/components/blocks/FeedbackWidget';

export function Footer() {
  return (
    <div className="fixed bottom-6 right-6">
      <FeedbackWidget
        onSubmit={async ({ rating, message }) => {
          await fetch('/api/feedback', {
            method: 'POST',
            body: JSON.stringify({ rating, message, page: location.pathname }),
          });
        }}
      />
    </div>
  );
}`,
      },
    ],
    props: [
      { name: 'onSubmit', type: '(data: { rating: number; message: string }) => Promise<void>', description: 'Called on send. The thank-you card appears once it resolves.' },
    ],
  },
  {
    slug: 'not-found',
    name: '404 / Not Found',
    description: 'A 404 page with a layered “404” that follows the pointer, a periodic glitch, docs search and suggested links. This site uses it as its real 404 page.',
    demos: [
      {
        title: 'Compact card',
        description: 'For empty states inside panels. Move the pointer over it to see the parallax.',
        component: NotFoundCardDemo,
        height: 520,
        code: `import { NotFoundCard } from '@/components/blocks/NotFound';

export function MissingDocument() {
  return <NotFoundCard onHome={() => navigate('/')} onNavigate={navigate} />;
}`,
      },
      {
        title: 'Full page',
        description: 'Fills its container with min-h-full. Search, link cards and the back button go through onNavigate and onHome.',
        component: NotFoundPageDemo,
        height: 520,
        code: `import { NotFoundPage } from '@/components/blocks/NotFound';

export function Router() {
  const route = useRoute();

  return (
    <main className="h-full overflow-y-auto">
      {route ? (
        <route.Page />
      ) : (
        <NotFoundPage
          onHome={() => navigate('/intro/home')}
          onNavigate={(path) => navigate(path)}
        />
      )}
    </main>
  );
}`,
      },
    ],
    props: [
      { name: 'onHome', type: '() => void', description: 'Called by the Back to home button.' },
      { name: 'onNavigate', type: '(path: string) => void', default: 'sets location.hash', description: 'Called by search results and the suggested link cards.' },
    ],
  },
  {
    slug: 'pull-to-refresh',
    name: 'Pull to Refresh',
    description: 'A mobile-style container you can drag down with rubber-band resistance to reveal a spinner and load new content.',
    demos: [
      {
        title: 'Feed',
        description: 'Drag the list down past the threshold and let go. New posts slide in at the top.',
        component: PullToRefreshDemo,
        height: 540,
        code: `import { PullToRefresh } from '@/components/blocks/PullToRefresh';

export function Feed() {
  const [posts, setPosts] = useState(initialPosts);

  return (
    <PullToRefresh
      className="h-full"
      onRefresh={async () => {
        const fresh = await api.fetchNewPosts();
        setPosts((p) => [...fresh, ...p]);
      }}
    >
      {posts.map((p) => <PostRow key={p.id} post={p} />)}
    </PullToRefresh>
  );
}`,
      },
    ],
    props: [
      { name: 'onRefresh', type: '() => Promise<void>', description: 'Runs after a release past the threshold. The spinner stays until it resolves.' },
      { name: 'children', type: 'ReactNode', description: 'Scrollable content. Pulling only starts when it is scrolled to the top.' },
      { name: 'className', type: 'string', description: 'Classes for the outer container, which needs a height.' },
    ],
  },
];
