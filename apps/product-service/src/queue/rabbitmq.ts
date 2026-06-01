import * as amqp from 'amqplib';

class RabbitMQClient {
  private connection: Awaited<ReturnType<typeof amqp.connect>> | null = null;
  private channel: amqp.Channel | null = null;

  async connect(url: string) {
    try {
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      console.log('Conectado ao RabbitMQ com sucesso!');
    } catch (error) {
      console.error('Erro ao conectar ao RabbitMQ:', error);
      process.exit(1);
    }
  }

  async publishInQueue(queue: string, message: string | object) {
    if (!this.channel) {
      throw new Error('Canal do RabbitMQ não está inicializado!');
    }

    await this.channel.assertQueue(queue, { durable: true });

    const content = Buffer.from(JSON.stringify(message));

    this.channel.sendToQueue(queue, content);
  }
}

export const rabbitMQ = new RabbitMQClient();
