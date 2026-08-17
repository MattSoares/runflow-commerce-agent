import type { Request, Response } from 'express';

import { CommerceAgent } from '../agent/commerceAgent.js';
import { chatSchema } from '../schemas/chatSchemas.js';

const agent = new CommerceAgent();

export async function chat(request: Request, response: Response): Promise<void> {
  const input = chatSchema.parse(request.body);
  const answer = await agent.chat(input.sessionId, input.message);
  response.status(200).json({ data: { sessionId: input.sessionId, message: answer } });
}
