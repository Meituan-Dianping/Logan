/**
 * Example client for testing the LLM Chat Application
 * 
 * This script demonstrates how to interact with the LLM chat API
 * and shows the Logan logging integration in action.
 */

const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';

interface ChatResponse {
  response: string;
  model: string;
  tokens: number;
  latency: number;
}

/**
 * Send a chat message to the LLM service
 */
async function sendChatMessage(
  prompt: string,
  userId: string,
  sessionId: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userId,
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error while sending chat message: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Get chat history for a session
 */
async function getChatHistory(sessionId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/${sessionId}`);

    if (!response.ok) {
      throw new Error(`Failed to get chat history: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Network error while fetching chat history: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Run example conversation
 */
async function runExample() {
  console.log('🚀 Starting LLM Chat Example...\n');

  const userId = 'example_user_' + Date.now();
  const sessionId = 'example_session_' + Date.now();

  const prompts = [
    'Hello, can you help me?',
    'What are the best practices for logging in production applications?',
    'Tell me about LLM applications',
  ];

  try {
    for (const prompt of prompts) {
      console.log(`📝 User: ${prompt}`);
      
      const result = await sendChatMessage(prompt, userId, sessionId);
      
      console.log(`🤖 Assistant: ${result.response}`);
      console.log(`📊 Metrics: ${result.tokens} tokens, ${result.latency}ms latency\n`);
      
      // Small delay between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('📜 Fetching chat history...\n');
    const history = await getChatHistory(sessionId);
    console.log('Chat History:', JSON.stringify(history, null, 2));

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
}

export { sendChatMessage, getChatHistory };
