import Fastify from 'fastify';
import { productRoutes } from './routes/product.routes';

const app = Fastify({ logger: true });

app.register(productRoutes, { prefix: '/api/products' });

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3002;
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Product Service rodando na porta ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};
