# nextjs-openai-chat-course
follow along to "Learn NextJS 13 by Building a Modern Full-Stack OpenAI Chatbot" by "Josh tried coding" on youtube

## Notes

- `npm run dev` to start the dev server
- `npm run build` + `npm run start` for prod
- `src/app`: root of the file based routing;
- `app/page.tsx`: man app page in `/`, like an `index.php`
- `layout.tsx`: layout wrapper component; can be used to show components that should be visible everywhere; also for metadata (title etc.)

- [shadcn](https://ui.shadcn.com): component library ("This is NOT a component library. It's a collection of re-usable components that you can copy and paste into your apps.") used (based on tailwind and [radix](https://www.radix-ui.com/) unstyled components)

Correct way to pass additional classes to a component wrapping a div:

```typescript
import React, {HTMLAttributes} from 'react';
import {cn} from "@/lib/utils";

interface ChatInputPropsType extends HTMLAttributes<HTMLDivElement> {}

export const ChatInput = ({className, ...props}: ChatInputPropsType) => {
    return (<div {...props} className={cn('border-t border-zinc-300', className)}></div>);
};

```

By default, all NextJS 13 components are rendered on the server.

To make a component render on the client, add `"use client"` at the top of the component.

```typescript
"use client"

import React, {HTMLAttributes} from 'react';
import {cn} from "@/lib/utils";
import TextareaAutosize from 'react-textarea-autosize'
// ...
```

`tailwind.config.js`:

```typescript
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
            // tailwind classes can be extended;
            // we got this from the shadcn accordion site
            keyframes: {
                "accordion-down": {
                    from: {height: 0},
                    to: {height: "var(--radix-accordion-content-height)"},
                },
                "accordion-up": {
                    from: {height: "var(--radix-accordion-content-height)"},
                    to: {height: 0},
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    // @tailwindcss/forms (must be installed)
    // auto-pretties up forms
    plugins: [
        require('@tailwindcss/forms')
    ],
}

```

React query with nextjs:

As every component is by default a server component, we can't put context providers such as QueryClientProvider in th layout.tsx.

Workaround:

Create new component `Providers`:

```tsx
"use client"

import React from 'react';
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

type ProvidersPropsType = {
    children: React.ReactNode;
};

export const Providers = ({children}: ProvidersPropsType) => {
    const queryClient = new QueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
```

Wrap in `layout.tsx`:

```tsx
// ...
export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <Providers>
            <body className={'font-arial'}>
                <Chat/>
                    {children}
                </body>
            </Providers>
            </html>
    )
}
// ...
```

- *Doesn't this make every child component of `Providers` a client component?*

gpt:
>>In Next.js 13, the "use client" directive is used to indicate that a file should be treated as client-side only. This means that the file and any components it exports will not be included in the server-side rendering process, and will only be loaded and executed in the browser.

>>However, the "use client" directive does not propagate down to child components. In other words, if you wrap components in a component that uses "use client" at the top, those wrapped components will not automatically be treated as client components. Each file that should be treated as client-side only needs to have its own "use client" directive at the top.

API endpoints:

To access endpoints such as `/api/message` in the frontend, create an `api` folder in `src/app`;

`src/app/api/message/route.ts`:

```typescript
// route.ts is a reserved file name
// the exported function must have the name of the http verb

// This is executed server side by node, so we can do security checks here
import {MessageArraySchema} from "@/lib/validators/message";
import {ChatGPTMessage} from "@/lib/openai-stream";
import {chatbotPrompt} from "@/helpers/chatbot-prompts";

export async function POST(req: Request) {
    const {messages} = await req.json();
    const parsedMessages = MessageArraySchema.parse(messages);

    const outboundMessages: ChatGPTMessage[] = parsedMessages.map((message)=>{
        return {
            role: message.isUserMessage ? 'user' : 'system',
            content: message.text
        };
    });

    // add the main (first) prompt to the messagelist to brief chatGPT
    outboundMessages.unshift({
        role: 'system',
        content: chatbotPrompt
    })
}
```

Secrets / .envs:

In the project root, an file `.env.local` can be defined; The environment variables defined there are only accessible by the NextJS backend (not exposed to the client) *unless* prefixed with `NEXT_PUBLIC_`.

`.env.local`:

```dotenv
SECRET_API_KEY=abc123 # only accessible on the server
NEXT_PUBLIC_SOME_VAR=xyz # accessible in frontend
```

Both in frontend and backend, these are accessible like usual using `process.env.VAR_NAME`, e.g. `process.env.NEXT_PUBLIC_SOME_VAR`. 






This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
