import Fastify from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { authRoutes } from './routes/auth.routes';
import { z } from 'zod';

const fastify = Fastify({
  logger: true,
});

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET não configurado nas variáveis de ambiente!');
}

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET,
});

fastify.get('/health', async (request, reply) => {
  return { status: 'OK', service: 'Auth Service' };
});

fastify.register(authRoutes, { prefix: '/api/auth' });

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
