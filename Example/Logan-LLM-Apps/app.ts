import express from 'express';
import logger from 'morgan';

/**
 * LLM Chat Application with Logan Logging Integration
 * 
 * This example demonstrates how to integrate Logan logging into an LLM-based application.
 * It simulates a simple chat application where user interactions and LLM responses are logged.
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

interface LLMRequest {
  prompt: string;
  userId: string;
  sessionId: string;
}

interface LLMResponse {
  response: string;
  model: string;
  tokens: number;
  latency: number;
}

const app = express();
const port = process.env.PORT || 3000;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// In-memory storage for demo purposes
const chatSessions: Map<string, ChatMessage[]> = new Map();

/**
 * Logger utility that would integrate with Logan
 * In a real implementation, this would use Logan SDK to log events
 */
class LLMLogger {
  static logUserPrompt(userId: string, sessionId: string, prompt: string) {
    const logData = {
      type: 'llm_user_prompt',
      userId,
      sessionId,
      prompt,
      timestamp: Date.now(),
    };
    console.log('[LOGAN LOG]', JSON.stringify(logData));
  }

  static logLLMResponse(
    userId: string,
    sessionId: string,
    response: string,
    model: string,
    tokens: number,
    latency: number
  ) {
    const logData = {
      type: 'llm_response',
      userId,
      sessionId,
      response,
      model,
      tokens,
      latency,
      timestamp: Date.now(),
    };
    console.log('[LOGAN LOG]', JSON.stringify(logData));
  }

  static logError(userId: string, sessionId: string, error: string) {
    const logData = {
      type: 'llm_error',
      userId,
      sessionId,
      error,
      timestamp: Date.now(),
    };
    console.error('[LOGAN LOG ERROR]', JSON.stringify(logData));
  }

  static logPerformanceMetric(metric: string, value: number, context: any) {
    const logData = {
      type: 'llm_performance',
      metric,
      value,
      context,
      timestamp: Date.now(),
    };
    console.log('[LOGAN LOG]', JSON.stringify(logData));
  }
}

// Constants for simulation
const SIMULATED_LATENCY_MIN_MS = 500;
const SIMULATED_LATENCY_MAX_MS = 1500;
const SIMULATED_TOKENS_MIN = 100;
const SIMULATED_TOKENS_MAX = 600;

/**
 * Simulated LLM service
 * In a real application, this would call actual LLM APIs (OpenAI, Anthropic, etc.)
 */
async function callLLMService(prompt: string): Promise<{ response: string; tokens: number }> {
  // Simulate API latency
  const latency = Math.random() * (SIMULATED_LATENCY_MAX_MS - SIMULATED_LATENCY_MIN_MS) + SIMULATED_LATENCY_MIN_MS;
  await new Promise(resolve => setTimeout(resolve, latency));
  
  // Simulated responses
  const responses = [
    "Based on your query, here's what I found...",
    "That's an interesting question. Let me explain...",
    "I understand you're asking about...",
    "Here's a detailed explanation of...",
  ];
  
  const response = responses[Math.floor(Math.random() * responses.length)] + " " + prompt;
  const tokens = Math.floor(Math.random() * (SIMULATED_TOKENS_MAX - SIMULATED_TOKENS_MIN)) + SIMULATED_TOKENS_MIN;
  
  return { response, tokens };
}

/**
 * Chat endpoint - handles user prompts and returns LLM responses
 */
app.post('/chat', async (req, res) => {
  const { prompt, userId, sessionId }: LLMRequest = req.body;

  if (!prompt || !userId || !sessionId) {
    return res.status(400).json({ error: 'Missing required fields: prompt, userId, sessionId' });
  }

  try {
    const startTime = Date.now();

    // Log user prompt
    LLMLogger.logUserPrompt(userId, sessionId, prompt);

    // Get or create chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, []);
    }
    const session = chatSessions.get(sessionId);
    if (!session) {
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Add user message to session
    session.push({
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    });

    // Call LLM service
    const { response, tokens } = await callLLMService(prompt);
    const latency = Date.now() - startTime;

    // Add assistant response to session
    session.push({
      role: 'assistant',
      content: response,
      timestamp: Date.now(),
    });

    // Log LLM response
    LLMLogger.logLLMResponse(userId, sessionId, response, 'simulated-llm-v1', tokens, latency);

    // Log performance metrics
    LLMLogger.logPerformanceMetric('response_time', latency, { userId, sessionId, tokens });

    const llmResponse: LLMResponse = {
      response,
      model: 'simulated-llm-v1',
      tokens,
      latency,
    };

    res.status(200).json(llmResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    LLMLogger.logError(userId, sessionId, errorMessage);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

/**
 * Get chat history for a session
 */
app.get('/chat/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = chatSessions.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.status(200).json({ sessionId, messages: session });
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});

app.listen(port, () => {
  console.log(`LLM Chat Application running on port ${port}`);
  console.log(`Try: POST /chat with { "prompt": "Hello", "userId": "user123", "sessionId": "session123" }`);
});

export default app;
