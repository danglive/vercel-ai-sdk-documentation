import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Next.js App Router: Configure the Node.js runtime (to ensure it doesn't run on the edge)
export const runtime = 'nodejs';

// Optional: Limit the streaming timeout duration
export const maxDuration = 30;

/**
 * Professional Chat API route integrating GPT-4o with Vercel AI SDK.
 * - Supports messages (a list of messages)
 * - Supports attachments (experimental_attachments) for file handling
 * - Streams the response back to the client
 * - Customizes error messages and sends usage tokens
 */
export async function POST(req: Request) {
  try {
    // Retrieve JSON data from the request
    const { messages, experimental_attachments } = await req.json();

    // 1. [Optional] Process attachments (PDF, DOCX, CSV, Excel, image, audio, etc.)
    //    In the Vercel AI SDK, attachments are sent as data URLs (base64) or URLs.
    //    Depending on your needs, you can:
    //    - Save the file to S3 / Cloud Storage
    //    - Parse the content (CSV -> JSON, extract text from PDF, etc.)
    //    - Or simply log them for demo purposes
    if (experimental_attachments && Array.isArray(experimental_attachments)) {
      console.log('Received attachments:', experimental_attachments.map((f: any) => ({
        name: f.name,
        contentType: f.contentType,
        size: f.size,
        // url: f.url (usually a data URL or link)
      })));
      // Example: parse CSV, extract text from PDF, etc. (to be implemented)
    }

    // 2. Create a streaming response from the GPT-4o model
    //    - system: prompt "you are a smart assistant..."
    //    - messages: message history (user/assistant)
    //    - You can add context, guardrails, etc., as needed
    const result = streamText({
      model: openai('gpt-4o', {
        // API key configuration (should be set in .env.local)
        apiKey: process.env.OPENAI_API_KEY,
      }),
      system: 'You are a helpful, knowledgeable assistant. Please provide detailed and accurate responses.',
      messages,
    });

    // 3. Return a DataStreamResponse with options:
    //    - sendUsage: send token usage information
    //    - getErrorMessage: customize the error message sent to the client
    //    - sendReasoning, sendSources: (if your model and pipeline support them)
    return result.toDataStreamResponse({
      sendUsage: true,
      // Enable sendReasoning if your model supports reasoning tokens (e.g., deepseek-reasoner)
      // sendReasoning: true,
      // Enable sendSources if your model supports displaying "sources" (e.g., Google GenAI, Perplexity, etc.)
      // sendSources: true,

      // Customize the error message
      getErrorMessage: (error) => {
        // In production, return a generic message to avoid exposing sensitive information
        if (!error) return 'Unknown error';

        if (typeof error === 'string') {
          return error;
        } else if (error instanceof Error) {
          // Optionally: log detailed error server-side and return a simple message client-side
          console.error('Stream error:', error);
          return error.message || 'An error occurred while processing.';
        }
        // Fallback
        return 'An unexpected error occurred.';
      },
    });
  } catch (err: any) {
    // 4. Catch errors outside of try-catch
    console.error('Server error in /api/chat:', err);
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}