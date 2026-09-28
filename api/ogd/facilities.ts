import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleApiRequest } from '../../server/apiProxy.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  await handleApiRequest(req, res);
}
