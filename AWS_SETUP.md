# AWS Setup Instructions

This guide will help you configure AWS Bedrock and Lex for the chatbot application.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI installed and configured
3. Access to AWS Bedrock and Lex services

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_REGION=us-east-1

# Lex Configuration (Optional)
LEX_BOT_ID=your_lex_bot_id_here
LEX_BOT_ALIAS_ID=your_lex_bot_alias_id_here
LEX_LOCALE_ID=en_US

# Custom Prompts (Optional)
DEFAULT_SYSTEM_PROMPT=You are a helpful AI assistant. Be conversational and friendly.
FUNNY_SYSTEM_PROMPT=You are a witty and humorous AI assistant. Make jokes and be entertaining while still being helpful.
PROFESSIONAL_SYSTEM_PROMPT=You are a professional AI assistant. Be formal, precise, and business-oriented in your responses.
```

## AWS Bedrock Setup

### 1. Enable Model Access

1. Go to AWS Bedrock Console
2. Navigate to "Model access" in the left sidebar
3. Request access to the Claude 3 Sonnet model
4. Wait for approval (usually instant for most accounts)

### 2. Test Model Access

```bash
aws bedrock-runtime invoke-model \
    --model-id anthropic.claude-3-sonnet-20240229-v1:0 \
    --body '{"anthropic_version":"bedrock-2023-05-31","max_tokens":100,"messages":[{"role":"user","content":"Hello"}]}' \
    --cli-binary-format raw-in-base64-out \
    response.json
```

## AWS Lex Setup (Optional)

### 1. Create a Lex Bot

1. Go to AWS Lex Console
2. Create a new bot:
   - Bot name: `ChatbotAssistant`
   - IAM role: Create a new role
   - Language: English (US)
   - Voice interaction: Choose a voice

### 2. Configure Intents

Create basic intents like:

- `Greeting` - For hello, hi, etc.
- `Help` - For help requests
- `Goodbye` - For farewell messages

### 3. Build and Deploy

1. Build the bot
2. Create an alias (e.g., `DRAFT` or `PROD`)
3. Note the Bot ID and Alias ID for environment variables

## IAM Permissions

Ensure your AWS user/role has the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0"
    },
    {
      "Effect": "Allow",
      "Action": ["lex:RecognizeText", "lex:RecognizeUtterance"],
      "Resource": "arn:aws:lex:*:*:bot/*"
    }
  ]
}
```

## Testing the Setup

1. Start the development server:

   ```bash
   pnpm run dev
   ```

2. Open http://localhost:3000

3. Try different prompts:
   - Switch between personality modes (Default, Funny, Professional, etc.)
   - Enable/disable Lex NLU
   - Test voice input (if Lex is configured)

## Troubleshooting

### Common Issues

1. **"Unknown font" error**: This is related to the font configuration and should not affect AWS functionality.

2. **Bedrock access denied**: Ensure you have requested model access in the Bedrock console.

3. **Lex bot not found**: Verify the Bot ID and Alias ID in your environment variables.

4. **Credentials error**: Check your AWS credentials and permissions.

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

Check the browser console and server logs for detailed error messages.

## Features

### Personality Modes

- **Default**: Balanced, helpful responses
- **Funny**: Humorous and entertaining
- **Professional**: Formal business communication
- **Creative**: Imaginative and innovative
- **Medical**: Healthcare-focused (with disclaimers)

### Lex Integration

- Natural Language Understanding
- Intent recognition
- Audio input processing
- Session management

### Chat Features

- Real-time messaging
- Message history
- Audio transcription
- File attachments (if enabled)
- Prompt suggestions

## Cost Considerations

- Bedrock: Pay per token used
- Lex: Pay per request
- Consider implementing usage limits for production

## Security Notes

- Never commit `.env.local` to version control
- Use IAM roles in production instead of access keys
- Implement rate limiting for production use
- Consider using AWS Secrets Manager for credentials
