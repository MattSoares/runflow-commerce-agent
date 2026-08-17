import { AppError } from '../errors/appError.js';
import { systemPrompt } from './systemPrompt.js';
import { toolDeclarations } from './toolDefinitions.js';
import type { GeminiContent, LanguageModel } from './types.js';

export class GeminiClient implements LanguageModel {
  constructor(
    private readonly apiKey = process.env.GEMINI_API_KEY,
    private readonly model = process.env.GEMINI_MODEL ?? 'gemini-3.5-flash-lite',
  ) {}

  async generate(contents: GeminiContent[]): Promise<GeminiContent> {
    const apiKey = this.apiKey;

    if (!apiKey) {
      throw new AppError(503, 'LLM_NOT_CONFIGURED', 'Configure GEMINI_API_KEY para conversar com o agente.');
    }

    let response: Response;

    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            tools: [{ functionDeclarations: toolDeclarations }],
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
    } catch {
      throw new AppError(
        502,
        'LLM_UNAVAILABLE',
        'Não foi possível conectar ao modelo de linguagem. Tente novamente.',
      );
    }

    if (!response.ok) {
      const details = await response.text();
      console.error('Gemini API error:', response.status, details);

      if (response.status === 429) {
        throw new AppError(
          429,
          'LLM_RATE_LIMITED',
          'O limite temporário do modelo foi atingido. Aguarde alguns segundos e tente novamente.',
        );
      }

      if (response.status === 401 || response.status === 403) {
        throw new AppError(
          502,
          'LLM_AUTH_ERROR',
          'A credencial do modelo não foi aceita. Verifique a configuração.',
        );
      }

      if (response.status === 404) {
        throw new AppError(
          502,
          'LLM_MODEL_NOT_FOUND',
          `O modelo ${this.model} não está disponível. Verifique GEMINI_MODEL.`,
        );
      }

      throw new AppError(502, 'LLM_ERROR', 'O modelo de linguagem não pôde responder agora.');
    }

    const payload = await response.json() as {
      candidates?: Array<{ content?: GeminiContent }>;
    };
    const content = payload.candidates?.[0]?.content;

    if (!content?.parts?.length) {
      throw new AppError(502, 'EMPTY_LLM_RESPONSE', 'O modelo não produziu uma resposta.');
    }

    return content;
  }
}
