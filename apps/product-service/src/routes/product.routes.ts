import { FastifyInstance } from 'fastify';
import {
  createProductSchema,
  idParamSchema,
  updateProductSchema,
} from '../schemas/product.schema';
import { db } from '../db/index';
import { products } from '../db/schema';
import { eq } from 'drizzle-orm';
import { rabbitMQ } from '../queue/rabbitmq.js';

export async function productRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      const userId = request.user.sub;

      fastify.log.info(`Usuário ${userId} está criando um produto.`);

      try {
        const data = createProductSchema.parse(request.body);

        const [newProduct] = await db
          .insert(products)
          .values({
            name: data.name,
            description: data.description,
            price: data.price.toString(),
            stock: data.stock,
          })
          .returning();

        await rabbitMQ.publishInQueue('product.created', {
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          timestamp: new Date(),
        });

        return reply.status(201).send(newProduct);
      } catch (error: any) {
        return reply.status(400).send({ error: error.issues || error.message });
      }
    },
  );

  fastify.get('/', async (request, reply) => {
    const allProducts = await db.select().from(products);
    return reply.send(allProducts);
  });

  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);

      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, id));

      if (!product) {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }
      return reply.send(product);
    } catch (error: any) {
      return reply.status(400).send({ error: error.issues || error.message });
    }
  });

  fastify.put(
    '/:id',
    { onRequest: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const { id } = idParamSchema.parse(request.params);
        const data = updateProductSchema.parse(request.body);

        const [updatedProduct] = await db
          .update(products)
          .set({
            ...data,
            price: data.price !== undefined ? data.price.toString() : undefined,
            updatedAt: new Date(),
          })
          .where(eq(products.id, id))
          .returning();

        if (!updatedProduct) {
          return reply.status(404).send({ erro: 'Produto não encontrado' });
        }
        return reply.send(updatedProduct);
      } catch (error: any) {
        return reply.status(400).send({ error: error.issues || error.message });
      }
    },
  );

  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);

      const [deletedProduct] = await db
        .delete(products)
        .where(eq(products.id, id))
        .returning();

      if (!deletedProduct) {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }

      return reply.send({ message: 'Produto deletado com sucesso' });
    } catch (error: any) {
      return reply.status(400).send({ error: error.issues || error.message });
    }
  });
}
