import type { DocEntry } from '@/docs/types';
import { SignInDemo } from '@/components/app/SignIn';
import { SignUpDemo } from '@/components/app/SignUp';
import { OtpVerifyDemo } from '@/components/app/OtpVerify';
import { MagicLinkDemo } from '@/components/app/MagicLink';
import { PasswordResetDemo } from '@/components/app/PasswordReset';

export const appAuthEntries: DocEntry[] = [
  {
    slug: 'sign-in',
    name: 'Sign In',
    description: 'A split sign-in screen with SSO buttons, inline validation, a show-password toggle, remember me and a loading-to-success button.',
    badge: 'New',
    demos: [
      {
        title: 'Split layout',
        description: 'The first attempt fails on purpose to show the error state. Sign in again to see success.',
        component: SignInDemo,
        height: 640,
        code: `import { SignIn } from '@/components/app/SignIn';

<SignIn
  onSubmit={async ({ email, password, remember }) => {
    const res = await auth.signIn(email, password, { remember });
    if (!res.ok) return 'That password doesn’t match.';
  }}
/>`,
      },
    ],
    props: [
      { name: 'onSubmit', type: '(v) => Promise<string | void>', description: 'Return a string to show it as a form error.' },
      { name: 'split', type: 'boolean', default: 'true', description: 'Show the brand panel beside the form on wide screens.' },
      { name: 'className', type: 'string', description: 'Extra classes for the card.' },
    ],
  },
  {
    slug: 'sign-up',
    name: 'Sign Up',
    description: 'A sign-up card with a live password strength meter, requirement checklist, terms checkbox and plan badge.',
    badge: 'New',
    demos: [
      {
        title: 'With strength meter',
        description: 'Type a password to watch the meter and checklist update.',
        component: SignUpDemo,
        height: 760,
        code: `import { SignUp } from '@/components/app/SignUp';

<SignUp plan="Pro trial · 14 days" onSubmit={({ name, email, password }) => auth.signUp({ name, email, password })} />`,
      },
    ],
    props: [
      { name: 'plan', type: 'string', default: "'Pro trial · 14 days'", description: 'Text in the plan badge.' },
      { name: 'onSubmit', type: '(v) => Promise<void>', description: 'Called once the form is valid.' },
    ],
  },
  {
    slug: 'otp-verify',
    name: 'One-Time Code',
    description: 'A six-digit code input with paste support, auto-advance, arrow keys, a resend countdown, an error shake and a success state.',
    badge: 'New',
    demos: [
      {
        title: 'Verify by email',
        description: 'The demo code is 424242. Try pasting it, or type a wrong code to see the shake.',
        component: OtpVerifyDemo,
        height: 520,
        code: `import { OtpVerify } from '@/components/app/OtpVerify';

<OtpVerify destination={user.email} onVerify={(code) => auth.verify(code)} resendSeconds={30} />`,
      },
    ],
    props: [
      { name: 'length', type: 'number', default: '6', description: 'Number of digits.' },
      { name: 'destination', type: 'string', description: 'Where the code was sent.' },
      { name: 'onVerify', type: '(code: string) => Promise<boolean>', description: 'Resolve true for a valid code.' },
      { name: 'resendSeconds', type: 'number', default: '30', description: 'Countdown before resend is allowed.' },
      { name: 'initial', type: 'string', description: 'Pre-filled digits.' },
    ],
  },
  {
    slug: 'magic-link',
    name: 'Magic Link',
    description: 'Passwordless sign-in: email a link, then an animated “check your inbox” state with open-mail-app buttons and resend.',
    badge: 'New',
    demos: [
      {
        title: 'Passwordless',
        description: 'Send the link to see the inbox state and resend timer.',
        component: MagicLinkDemo,
        height: 480,
        code: `import { MagicLink } from '@/components/app/MagicLink';

<MagicLink onSend={(email) => auth.sendMagicLink(email)} />`,
      },
    ],
    props: [
      { name: 'defaultEmail', type: 'string', description: 'Pre-filled email.' },
      { name: 'onSend', type: '(email: string) => Promise<void>', description: 'Sends the link.' },
      { name: 'resendSeconds', type: 'number', default: '20', description: 'Countdown before resend.' },
    ],
  },
  {
    slug: 'password-reset',
    name: 'Password Reset',
    description: 'A three-step reset flow: request a link, check email, set a new password with strength meter and confirm, then success.',
    badge: 'New',
    demos: [
      {
        title: 'Reset flow',
        description: 'Walk through all three steps; the email step has a demo button to continue.',
        component: PasswordResetDemo,
        height: 600,
        code: `import { PasswordReset } from '@/components/app/PasswordReset';

<PasswordReset defaultEmail={email} initialStep={token ? 2 : 0} />`,
      },
    ],
    props: [
      { name: 'defaultEmail', type: 'string', description: 'Pre-filled email.' },
      { name: 'initialStep', type: '0 | 1 | 2 | 3', default: '0', description: 'Start step, e.g. 2 when arriving from the email link.' },
    ],
  },
];
