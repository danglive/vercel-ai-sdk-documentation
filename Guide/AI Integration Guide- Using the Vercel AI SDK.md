# V0 AI Integration Guide: Using the Vercel AI SDK

## Table of Contents
- [Introduction](#introduction)
- [Core Architecture](#core-architecture)
  - [Model Information](#model-information)
  - [AI SDK Integration](#ai-sdk-integration)
  - [Basic Usage Example](#basic-usage-example)
- [AI SDK Overview](#ai-sdk-overview)
  - [Core Functions](#core-functions)
  - [Language Model Middleware](#language-model-middleware)
- [Implementation Guide: Building a Chatbot](#implementation-guide-building-a-chatbot)
  - [Basic Setup](#basic-setup)
  - [Creating an API Route](#creating-an-api-route)
  - [Advanced UI Features](#advanced-ui-features)
    - [Status Tracking](#status-tracking)
    - [Error Handling](#error-handling)
    - [Message Management](#message-management)
    - [Controlled Input](#controlled-input)
    - [Cancellation and Regeneration](#cancellation-and-regeneration)
    - [Throttling UI Updates](#throttling-ui-updates)
  - [Event Callbacks](#event-callbacks)
  - [Request Configuration](#request-configuration)
    - [Custom Headers, Body, and Credentials](#custom-headers-body-and-credentials)
    - [Setting Custom Body Fields per Request](#setting-custom-body-fields-per-request)
  - [Controlling the Response Stream](#controlling-the-response-stream)
    - [Error Messages](#error-messages)
    - [Usage Information](#usage-information)
    - [Text Streams](#text-streams)
  - [Empty Submissions](#empty-submissions)
  - [Reasoning](#reasoning)
  - [Sources](#sources)
  - [Attachments (Experimental)](#attachments-experimental)
    - [FileList](#filelist)
    - [URLs](#urls)
- [Capabilities and Limitations](#capabilities-and-limitations)
- [Domain Knowledge](#domain-knowledge)

## Introduction

V0 is powered by OpenAI's GPT-4o language model and integrates with applications using the Vercel AI SDK. This document provides comprehensive information on how to implement and use the AI SDK to create AI-powered applications.

## Core Architecture

### Model Information

- The model is referred to as 'gpt-4o' in the AI SDK integration
- It is accessed through the AI SDK, specifically using the `openai` function from the `@ai-sdk/openai` package

### AI SDK Integration

- V0 uses the AI SDK and tooling from the source `sdk.vercel.ai`
- V0 ONLY uses the AI SDK via 'ai' and '@ai-sdk'
- V0 answers AI-related questions with JavaScript instead of Python
- V0 avoids libraries which are not part of the '@ai-sdk', for example, avoid 'langchain' or 'openai-edge'
- V0 NEVER uses `runtime = 'edge'` in API routes when using the AI SDK

### Basic Usage Example

```javascript
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

const { text } = await generateText({
  model: openai("gpt-4o"),
  prompt: "What is love?"
})
```

## AI SDK Overview

The AI SDK is a TypeScript toolkit for building AI-powered applications with frameworks like React, Next.js, Vue, Svelte, and Node.js. It provides a unified API for working with different AI models.

Key components include:
- AI SDK Core (for generating text, structured objects, and tool calls with LLMs)
- AI SDK UI (for building chat and generative user interfaces)

### Core Functions

- **streamText**: For streaming text from LLMs, ideal for interactive use cases
- **generateText**: For generating text for a given prompt and model, suitable for non-interactive use cases

### Language Model Middleware

An experimental feature in the AI SDK for enhancing language model behavior. Can be used for features like:
- Guardrails
- Retrieval Augmented Generation (RAG)
- Caching
- Logging

## Implementation Guide: Building a Chatbot

The `useChat` hook makes it effortless to create a conversational user interface for your chatbot application. It enables:

- **Message Streaming**: All messages from the AI provider are streamed to the chat UI in real-time
- **Managed States**: The hook manages the states for input, messages, status, error and more
- **Seamless Integration**: Easily integrate your chat AI into any design or layout with minimal effort

### Basic Setup

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input name="prompt" value={input} onChange={handleInputChange} />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
```

### Creating an API Route

```ts
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4-turbo'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

> **Note**: The UI messages have a new `parts` property that contains the message parts. We recommend rendering the messages using the `parts` property instead of the `content` property. The parts property supports different message types, including text, tool invocation, and tool result, and allows for more flexible and complex chat UIs.

In the `Page` component, the `useChat` hook will request to your AI provider endpoint whenever the user submits a message. The messages are then streamed back in real-time and displayed in the chat UI.

### Advanced UI Features

#### Status Tracking

The `useChat` hook returns a `status` with the following possible values:

- `submitted`: The message has been sent to the API and we're awaiting the start of the response stream
- `streaming`: The response is actively streaming in from the API, receiving chunks of data
- `ready`: The full response has been received and processed; a new user message can be submitted
- `error`: An error occurred during the API request, preventing successful completion

Usage example:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Page() {
  const { messages, input, handleInputChange, handleSubmit, status, stop } =
    useChat({});

  return (
    <>
      {messages.map(message => (
        <div key={message.id}>
          {message.role === 'user' ? 'User: ' : 'AI: '}
          {message.content}
        </div>
      ))}

      {(status === 'submitted' || status === 'streaming') && (
        <div>
          {status === 'submitted' && <Spinner />}
          <button type="button" onClick={() => stop()}>
            Stop
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="prompt"
          value={input}
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
        <button type="submit">Submit</button>
      </form>
    </>
  );
}
```

#### Error Handling

The `error` state reflects the error object thrown during the fetch request:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, error, reload } =
    useChat({});

  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      {error && (
        <>
          <div>An error occurred.</div>
          <button type="button" onClick={() => reload()}>
            Retry
          </button>
        </>
      )}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={handleInputChange}
          disabled={error != null}
        />
      </form>
    </div>
  );
}
```

> **Note**: We recommend showing a generic error message to the user, such as "Something went wrong." This is a good practice to avoid leaking information from the server.

#### Message Management

You can directly modify existing messages using `setMessages`:

```tsx
const { messages, setMessages, ... } = useChat()

const handleDelete = (id) => {
  setMessages(messages.filter(message => message.id !== id))
}

return <>
  {messages.map(message => (
    <div key={message.id}>
      {message.role === 'user' ? 'User: ' : 'AI: '}
      {message.content}
      <button onClick={() => handleDelete(message.id)}>Delete</button>
    </div>
  ))}
  ...
</>
```

You can think of `messages` and `setMessages` as a pair of `state` and `setState` in React.

#### Controlled Input

For more advanced scenarios such as form validation or customized components, you can use uncontrolled APIs:

```tsx
const { input, setInput, append } = useChat()

return <>
  <MyCustomInput value={input} onChange={value => setInput(value)} />
  <MySubmitButton onClick={() => {
    // Send a new message to the AI provider
    append({
      role: 'user',
      content: input,
    })
  }}/>
  ...
</>
```

#### Cancellation and Regeneration

Abort the response message while it's still streaming:

```tsx
const { stop, status, ... } = useChat()

return <>
  <button onClick={stop} disabled={!(status === 'streaming' || status === 'submitted')}>Stop</button>
  ...
</>
```

Request the AI provider to reprocess the last message:

```tsx
const { reload, status, ... } = useChat()

return <>
  <button onClick={reload} disabled={!(status === 'ready' || status === 'error')}>Regenerate</button>
  ...
</>
```

#### Throttling UI Updates

> **Note**: This feature is currently only available for React.

By default, the `useChat` hook will trigger a render every time a new chunk is received. You can throttle the UI updates:

```tsx
// page.tsx
const { messages, ... } = useChat({
  // Throttle the messages and data updates to 50ms:
  experimental_throttle: 50
})
```

### Event Callbacks

`useChat` provides optional event callbacks for different stages of the chatbot lifecycle:

```tsx
import { Message } from '@ai-sdk/react';

const {
  /* ... */
} = useChat({
  onFinish: (message, { usage, finishReason }) => {
    console.log('Finished streaming message:', message);
    console.log('Token usage:', usage);
    console.log('Finish reason:', finishReason);
  },
  onError: error => {
    console.error('An error occurred:', error);
  },
  onResponse: response => {
    console.log('Received HTTP response from server:', response);
  },
});
```

You can abort processing by throwing an error in the `onResponse` callback, which will trigger the `onError` callback.

### Request Configuration

#### Custom Headers, Body, and Credentials

Customize the request with additional options:

```tsx
const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: '/api/custom-chat',
  headers: {
    Authorization: 'your_token',
  },
  body: {
    user_id: '123',
  },
  credentials: 'same-origin',
});
```

#### Setting Custom Body Fields per Request

Configure custom `body` fields on a per-request basis:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            body: {
              customKey: 'customValue',
            },
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

Server-side retrieval:

```ts
// app/api/chat/route.ts
export async function POST(req: Request) {
  // Extract addition information ("customKey") from the body of the request:
  const { messages, customKey } = await req.json();
  //...
}
```

### Controlling the Response Stream

#### Error Messages

Control how error messages are sent back to the client:

```ts
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    getErrorMessage: error => {
      if (error == null) {
        return 'unknown error';
      }

      if (typeof error === 'string') {
        return error;
      }

      if (error instanceof Error) {
        return error.message;
      }

      return JSON.stringify(error);
    },
  });
}
```

#### Usage Information

Disable sending usage information:

```ts
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
  });

  return result.toDataStreamResponse({
    sendUsage: false,
  });
}
```

#### Text Streams

Handle plain text streams:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages } = useChat({
    streamProtocol: 'text',
  });

  return <>...</>;
}
```

> **Note**: When using `streamProtocol: 'text'`, tool calls, usage information and finish reasons are not available.

### Empty Submissions

Allow empty submissions:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  return (
    <div>
      {messages.map(m => (
        <div key={m.id}>
          {m.role}: {m.content}
        </div>
      ))}

      <form
        onSubmit={event => {
          handleSubmit(event, {
            allowEmptySubmit: true,
          });
        }}
      >
        <input value={input} onChange={handleInputChange} />
      </form>
    </div>
  );
}
```

### Reasoning

For models supporting reasoning tokens:

```ts
// app/api/chat/route.ts
import { deepseek } from '@ai-sdk/deepseek';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: deepseek('deepseek-reasoner'),
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: true,
  });
}
```

Client-side access to reasoning parts:

```tsx
// app/page.tsx
messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts.map((part, index) => {
      // text parts:
      if (part.type === 'text') {
        return <div key={index}>{part.text}</div>;
      }

      // reasoning parts:
      if (part.type === 'reasoning') {
        return <pre key={index}>{part.reasoning}</pre>;
      }
    })}
  </div>
));
```

### Sources

Some providers include sources in the response:

```ts
// app/api/chat/route.ts
import { perplexity } from '@ai-sdk/perplexity';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: perplexity('sonar-pro'),
    messages,
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
```

Client-side rendering of sources:

```tsx
// app/page.tsx
messages.map(message => (
  <div key={message.id}>
    {message.role === 'user' ? 'User: ' : 'AI: '}
    {message.parts
      .filter(part => part.type !== 'source')
      .map((part, index) => {
        if (part.type === 'text') {
          return <div key={index}>{part.text}</div>;
        }
      })}
    {message.parts
      .filter(part => part.type === 'source')
      .map(part => (
        <span key={`source-${part.source.id}`}>
          [
          <a href={part.source.url} target="_blank">
            {part.source.title ?? new URL(part.source.url).hostname}
          </a>
          ]
        </span>
      ))}
  </div>
));
```

### Attachments (Experimental)

#### FileList

Send multiple files as attachments using file input:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: files,
          });

          setFiles(undefined);

          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      >
        <input
          type="file"
          onChange={event => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
```

> **Note**: Currently, only `image/*` and `text/*` content types get automatically converted into multi-modal content parts. You will need to handle other content types manually.

#### URLs

Send URLs as attachments:

```tsx
// app/page.tsx
'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';
import { Attachment } from '@ai-sdk/ui-utils';

export default function Page() {
  const { messages, input, handleSubmit, handleInputChange, status } =
    useChat();

  const [attachments] = useState<Attachment[]>([
    {
      name: 'earth.png',
      contentType: 'image/png',
      url: 'https://example.com/earth.png',
    },
    {
      name: 'moon.png',
      contentType: 'image/png',
      url: 'data:image/png;base64,iVBORw0KGgo...',
    },
  ]);

  return (
    <div>
      <div>
        {messages.map(message => (
          <div key={message.id}>
            <div>{`${message.role}: `}</div>

            <div>
              {message.content}

              <div>
                {message.experimental_attachments
                  ?.filter(attachment =>
                    attachment.contentType?.startsWith('image/'),
                  )
                  .map((attachment, index) => (
                    <img
                      key={`${message.id}-${index}`}
                      src={attachment.url || "/placeholder.svg"}
                      alt={attachment.name}
                    />
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form
        onSubmit={event => {
          handleSubmit(event, {
            experimental_attachments: attachments,
          });
        }}
      >
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          disabled={status !== 'ready'}
        />
      </form>
    </div>
  );
}
```

> **Note**: The URL can also be a data URL which is a base64-encoded string that represents the content of a file. Currently, only `image/*` content types get automatically converted into multi-modal content parts.

## Capabilities and Limitations

- V0 is always up-to-date with the latest technologies and best practices
- V0 uses MDX format for responses, allowing embedding of React components
- V0 defaults to the Next.js App Router unless specified otherwise
- V0 can create and edit React components, handle file actions, implement accessibility best practices, and more
- V0 can use Mermaid for diagrams and LaTeX for mathematical equations
- V0 has access to certain environment variables and can request new ones if needed
- V0 refuses requests for violent, harmful, hateful, inappropriate, or sexual/unethical content

## Domain Knowledge

- V0 has domain knowledge retrieved via RAG (Retrieval Augmented Generation) to provide accurate responses
- V0 assumes the latest technology is in use, like the Next.js App Router over the Next.js Pages Router, unless otherwise specified
- V0 prioritizes the use of Server Components when working with React or Next.js
- V0 has knowledge of the recently released Next.js 15 and its new features
