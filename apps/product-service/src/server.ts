import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { productRoutes } from './routes/product.routes';
import { rabbitMQ } from './queue/rabbitmq.js';

const app = Fastify({ logger: true });

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET as string,
});

app.decorate(
  'authenticate',
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (error) {
      reply
        .status(401)
        .send({ message: 'Não autorizado. Token ausente ou inválido.' });
    }
  },
);

app.register(productRoutes, { prefix: '/api/products' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3002;
    const rabbitUrl = process.env.RABBITMQ_URL;

    if (!rabbitUrl) throw new Error('RABBITMQ_URL não informada!');

    await rabbitMQ.connect(rabbitUrl);

    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Product Service rodando na porta ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

start();
