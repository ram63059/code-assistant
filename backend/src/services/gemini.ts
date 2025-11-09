import { GoogleGenerativeAI } from '@google/generative-ai';
import { FileContent } from '../types';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
      }
    });
  }

  /**
   * Generates a streaming response for code assistance
   */
  async *generateStreamingResponse(
    userMessage: string,
    files: FileContent[],
    conversationHistory: Array<{ role: string; content: string }>
  ): AsyncGenerator<string, void, unknown> {
    try {
      const contextPrompt = this.buildContextPrompt(userMessage, files);

      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

      const chat = this.model.startChat({
        history: history,
      });

      const result = await chat.sendMessageStream(contextPrompt);

      for await (const chunk of result.stream) {
        const text = chunk.text();
        if (text) {
          yield text;
        }
      }
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Builds the context prompt with file contents
   */
  private buildContextPrompt(userMessage: string, files: FileContent[]): string {
    let prompt = '';

    if (files && files.length > 0) {
      prompt += '📁 **Uploaded Codebase Files:**\n\n';
      
      files.forEach((file, index) => {
        prompt += `**File ${index + 1}: ${file.filename}**\n`;
        prompt += '```\n';
        prompt += file.content;
        prompt += '\n```\n\n';
      });

      prompt += '---\n\n';
    }

    prompt += `**User Question:**\n${userMessage}\n\n`;
    
    prompt += `**Instructions:**
- Analyze the provided code files carefully
- Provide detailed, accurate answers with examples
- Use proper markdown formatting
- Include code snippets with syntax highlighting using \`\`\`language syntax
- Explain step-by-step when needed
- If suggesting changes, show before/after code
- Be concise but thorough
- Focus on best practices and code quality`;

    return prompt;
  }
}