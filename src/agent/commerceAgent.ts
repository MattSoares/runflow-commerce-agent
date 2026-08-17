import { AppError } from '../errors/appError.js';
import { executeTool } from '../tools/commerceTools.js';
import { GeminiClient } from './geminiClient.js';
import type { GeminiContent, LanguageModel } from './types.js';

const sessions = new Map<string, GeminiContent[]>();
const MAX_TOOL_ROUNDS = 6;
type ToolExecutor = (name: string, args: Record<string, unknown>) => Promise<unknown>;

export class CommerceAgent {
  constructor(
    private readonly model: LanguageModel = new GeminiClient(),
    private readonly toolExecutor: ToolExecutor = executeTool,
  ) {}

  async chat(sessionId: string, message: string): Promise<string> {
    // Trabalha em uma cópia: turnos que falham não contaminam a memória.
    const history = structuredClone(sessions.get(sessionId) ?? []);
    history.push({ role: 'user', parts: [{ text: message }] });

    for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
      const modelContent = await this.model.generate(history);
      history.push(modelContent);

      const calls = modelContent.parts.flatMap((part) => part.functionCall ? [part.functionCall] : []);
      if (calls.length === 0) {
        const answer = modelContent.parts.map(({ text }) => text ?? '').join('').trim();
        if (!answer) throw new AppError(502, 'EMPTY_LLM_RESPONSE', 'O agente não produziu uma resposta.');
        sessions.set(sessionId, history);
        return answer;
      }

      const responses = await Promise.all(calls.map(async (call) => ({
        functionResponse: {
          name: call.name,
          // O Gemini espera um objeto JSON no campo response.
          response: { result: await this.toolExecutor(call.name, call.args) },
        },
      })));
      history.push({ role: 'user', parts: responses });
    }

    throw new AppError(502, 'TOOL_LOOP_LIMIT', 'O agente excedeu o limite de chamadas de ferramentas.');
  }
}

export function clearSessions(): void {
  sessions.clear();
}
