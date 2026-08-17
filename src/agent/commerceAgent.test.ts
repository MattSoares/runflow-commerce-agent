import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CommerceAgent, clearSessions } from './commerceAgent.js';
import { AppError } from '../errors/appError.js';
import type { GeminiContent, LanguageModel } from './types.js';

class FakeModel implements LanguageModel {
  readonly receivedHistories: GeminiContent[][] = [];

  constructor(private readonly responses: GeminiContent[]) {}

  async generate(contents: GeminiContent[]): Promise<GeminiContent> {
    this.receivedHistories.push(structuredClone(contents));
    return this.responses.shift()!;
  }
}

describe('CommerceAgent', () => {
  it('executa uma tool e devolve a resposta final do modelo', async () => {
    clearSessions();
    const model = new FakeModel([
      { role: 'model', parts: [{ functionCall: { name: 'list_products', args: {} } }] },
      { role: 'model', parts: [{ text: 'Temos um mouse disponível.' }] },
    ]);
    const calls: string[] = [];
    const agent = new CommerceAgent(model, async (name) => {
      calls.push(name);
      return [{ id: 3, name: 'Mouse' }];
    });

    const answer = await agent.chat('session-1', 'Quais produtos vocês têm?');

    assert.equal(answer, 'Temos um mouse disponível.');
    assert.deepEqual(calls, ['list_products']);
    assert.equal(model.receivedHistories[1]![2]!.parts[0]!.functionResponse?.name, 'list_products');
  });

  it('mantém o histórico entre mensagens da mesma sessão', async () => {
    clearSessions();
    const model = new FakeModel([
      { role: 'model', parts: [{ text: 'O produto 3 é um mouse.' }] },
      { role: 'model', parts: [{ text: 'Ele custa R$ 179,90.' }] },
    ]);
    const agent = new CommerceAgent(model);

    await agent.chat('session-2', 'Mostre o produto 3.');
    await agent.chat('session-2', 'Quanto ele custa?');

    const secondTurnHistory = model.receivedHistories[1]!;
    assert.equal(secondTurnHistory.length, 3);
    assert.equal(secondTurnHistory[0]!.parts[0]!.text, 'Mostre o produto 3.');
    assert.equal(secondTurnHistory[2]!.parts[0]!.text, 'Quanto ele custa?');
  });

  it('não mantém no histórico uma mensagem cujo turno falhou', async () => {
    clearSessions();
    let attempt = 0;
    const receivedHistories: GeminiContent[][] = [];
    const model: LanguageModel = {
      async generate(contents) {
        receivedHistories.push(structuredClone(contents));
        attempt += 1;
        if (attempt === 1) throw new AppError(429, 'LLM_RATE_LIMITED', 'Limite atingido.');
        return { role: 'model', parts: [{ text: 'Segunda mensagem respondida.' }] };
      },
    };
    const agent = new CommerceAgent(model);

    await assert.rejects(() => agent.chat('session-3', 'Mensagem que falha.'));
    await agent.chat('session-3', 'Mensagem seguinte.');

    assert.equal(receivedHistories[1]!.length, 1);
    assert.equal(receivedHistories[1]![0]!.parts[0]!.text, 'Mensagem seguinte.');
  });
});
