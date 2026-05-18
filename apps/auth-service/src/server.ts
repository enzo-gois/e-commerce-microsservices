import Fastify from 'fastify';
import { z } from 'zod';

const fastify = Fastify({
  logger: true,
});

fastify.get('/health', async (request, reply) => {
  return { status: 'OK', service: 'Auth Service' };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log(`Auth Service rodando na porta 3001`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
