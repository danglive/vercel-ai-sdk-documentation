# Vercel AI SDK Documentation

Comprehensive documentation for the Vercel AI SDK and V0 integration.

## Contents

- [Introduction](#introduction)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
- [Key Features](#key-features)
- [Examples](#examples)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## Introduction

This repository contains detailed documentation about the Vercel AI SDK and how to integrate it with V0. It covers building chatbots, using technical components, and deploying applications powered by OpenAI's GPT-4o language model.

The Vercel AI SDK is a TypeScript toolkit designed to simplify building AI-powered applications with frameworks like React, Next.js, Vue, Svelte, and Node.js, providing a unified API for working with different AI models.

## Documentation

The documentation is organized into three main sections:

- [V0 AI Integration Guide](./docs/v0-ai-integration-guide.md) - Guide for integrating V0 AI with the Vercel AI SDK
- [Vercel AI SDK Chatbot Guide](./docs/vercel-ai-sdk-chatbot-guide.md) - Detailed guide for building chatbots using the Vercel AI SDK
- [V0 Technical Components](./docs/v0-technical-components.md) - Detailed descriptions of technical components and how to use V0

## Quick Start

### Basic Chat Component

```tsx
import { useChat } from '@ai-sdk/react';

export default function ChatComponent() {
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
        <button type="submit">Send</button>
      </form>
    </>
  );
}
```

### API Route Setup

```ts
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    system: 'You are a helpful assistant.',
    messages,
  });

  return result.toDataStreamResponse();
}
```

## Key Features

- **Model Integration**: Seamless integration with OpenAI's GPT-4o language model
- **Real-time Streaming**: Stream responses from AI models in real-time
- **Framework Agnostic**: Works with React, Next.js, Vue, Svelte, and Node.js
- **MDX Components**: Rich set of MDX components for creating and editing code
- **Next.js Runtime**: Lightweight browser-based Next.js runtime
- **Styling**: Built-in support for Tailwind CSS and shadcn/ui components
- **Accessibility**: Best practices for building accessible AI applications
- **Media Support**: Handling for images, audio, and 3D models
- **Node.js Execution**: Execute Node.js code directly in the browser

## Examples

Check out the code examples in the [examples](./examples) directory, including:

- Basic chat interfaces
- Advanced UI features
- Error handling
- Message management
- File attachments
- API customization

## Environment Variables

The following environment variables are supported out of the box:

### Firebase
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

### Cloudinary
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
