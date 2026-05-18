import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

export async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/register', async (request, reply) => {
    const registerSchema = z.object({
      name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
      email: z.string().email('E-mail inválido'),
      password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
    });

    const { name, email, password } = registerSchema.parse(request.body);

    const userExists = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (userExists) {
      return reply.status(400).send({ message: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return reply.status(201).send({
      message: 'Usuário criado com sucesso!',
      user: newUser,
    });
  });

  fastify.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email('E-mail inválido'),
      password: z.string(),
    });

    const { email, password } = loginSchema.parse(request.body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      return reply.status(400).send({ message: 'E-mail ou senha incorretos.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return reply.status(400).send({ message: 'E-mail ou senha incorretos.' });
    }

    const token = fastify.jwt.sign(
      {
        sub: user.id,
        email: user.email,
      },
      {
        expiresIn: '7d',
      },
    );

    return reply.send({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  });
}
