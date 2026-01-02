# Logan LLM Apps Example

This example demonstrates how to integrate Logan logging into LLM (Large Language Model) applications. It provides a simple chat application that shows how to log user prompts, LLM responses, performance metrics, and errors.

## Features

- **User Prompt Logging**: Track all user inputs to the LLM
- **Response Logging**: Log LLM responses with metadata (tokens, latency, model)
- **Performance Monitoring**: Track response times and resource usage
- **Error Tracking**: Capture and log errors during LLM interactions
- **Session Management**: Maintain conversation history per session

## Use Cases

This example is particularly useful for:

- **Aweme/TikTok-style apps** with AI-powered features (content recommendations, chat assistants, creative tools)
- **Debugging LLM interactions**: Understanding what prompts users send and what responses they receive
- **Performance optimization**: Tracking latency and token usage
- **Quality assurance**: Monitoring LLM output quality
- **Compliance and audit trails**: Maintaining logs of AI interactions

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

## Usage

### Start the server

```bash
npm start
# or
yarn start
```

The server will start on port 3000 (or the PORT environment variable if set).

### API Endpoints

#### 1. Send a chat message

```bash
POST /chat
Content-Type: application/json

{
  "prompt": "What is the weather today?",
  "userId": "user123",
  "sessionId": "session456"
}
```

Response:
```json
{
  "response": "Based on your query, here's what I found... What is the weather today?",
  "model": "simulated-llm-v1",
  "tokens": 342,
  "latency": 1234
}
```

#### 2. Get chat history

```bash
GET /chat/:sessionId
```

Response:
```json
{
  "sessionId": "session456",
  "messages": [
    {
      "role": "user",
      "content": "What is the weather today?",
      "timestamp": 1234567890
    },
    {
      "role": "assistant",
      "content": "Based on your query...",
      "timestamp": 1234567891
    }
  ]
}
```

#### 3. Health check

```bash
GET /health
```

## Logan Integration

This example demonstrates logging patterns for LLM applications:

### Log Types

1. **llm_user_prompt**: Logs when a user submits a prompt
   - userId
   - sessionId
   - prompt text
   - timestamp

2. **llm_response**: Logs when the LLM returns a response
   - userId
   - sessionId
   - response text
   - model name
   - token count
   - latency
   - timestamp

3. **llm_error**: Logs errors during LLM processing
   - userId
   - sessionId
   - error message
   - timestamp

4. **llm_performance**: Logs performance metrics
   - metric name
   - value
   - context (userId, sessionId, etc.)
   - timestamp

### Example Log Output

```
[LOGAN LOG] {"type":"llm_user_prompt","userId":"user123","sessionId":"session456","prompt":"Hello","timestamp":1704153200000}
[LOGAN LOG] {"type":"llm_response","userId":"user123","sessionId":"session456","response":"Hi there!","model":"simulated-llm-v1","tokens":150,"latency":823,"timestamp":1704153201000}
[LOGAN LOG] {"type":"llm_performance","metric":"response_time","value":823,"context":{"userId":"user123","sessionId":"session456","tokens":150},"timestamp":1704153201000}
```

## Integration with Real Logan SDK

To integrate with the actual Logan Web SDK, replace the `LLMLogger` class methods with Logan SDK calls:

```typescript
import Logan from 'logan-web';

Logan.initConfig({
  reportUrl: 'https://your-logan-server.com/log',
  publicKey: '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----',
  errorHandler: (e: any) => console.error(e)
});

// Log user prompt
Logan.log('llm_user_prompt', 1, JSON.stringify({
  userId,
  sessionId,
  prompt,
  timestamp: Date.now()
}));

// Log LLM response
Logan.log('llm_response', 1, JSON.stringify({
  userId,
  sessionId,
  response,
  model,
  tokens,
  latency,
  timestamp: Date.now()
}));
```

## Architecture

```
User Request → Express Server → LLM Service (simulated)
                    ↓
              Logan Logger
                    ↓
            Console/Logan Server
```

## Best Practices

1. **Privacy**: Be mindful of logging sensitive user data. Consider anonymizing or hashing user IDs.
2. **Log Levels**: Use appropriate log levels (info, warning, error) for different events.
3. **Sampling**: For high-traffic applications, consider sampling logs to reduce volume.
4. **Structured Logging**: Always use structured JSON logs for easy parsing and analysis.
5. **Performance**: Ensure logging doesn't significantly impact response times.

## Testing with cURL

```bash
# Send a chat message
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Tell me about AI", "userId": "user123", "sessionId": "session456"}'

# Get chat history
curl http://localhost:3000/chat/session456

# Health check
curl http://localhost:3000/health
```

## License

MIT
