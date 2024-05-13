const { Kafka } = require("kafkajs");
const fs = require("fs");
const path = require("path");

class KafkaConfig {
  constructor() {
    this.kafka = new Kafka({
      clientId: "youtube consumer",
      brokers: [process.env.KAFKA_SERVICE_URI],
      ssl: {
        ca: [fs.readFileSync(path.resolve("./ca.pem"), "utf-8")],
      },
      sasl: {
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
        mechanism: process.env.KAFKA_SASL_MECHANISM,
      },
    });
    this.producer = this.kafka.producer();
    this.consumer = this.kafka.consumer({ groupId: "youtube-consumer" });
  }

  async produce(topic, messages) {
    try {
      await this.producer.connect();
      await this.producer.send({
        topic: topic,
        messages: messages,
      });
    } catch (err) {
      console.error("Error producing messages:", err.message);
    } finally {
      await this.producer.disconnect();
    }
  }

  async consume(topic, callback) {
    try {
      await this.consumer.connect();
      await this.consumer.subscribe({ topic, fromBeginning: true });
      await this.consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          try {
            const value = message.value.toString();
            await callback(value);
            await this.consumer.commitOffsets([
              { topic, partition, offset: message.offset },
            ]);
            console.log("Message processed and committed successfully.");
          } catch (err) {
            console.error("Error processing message:", err.message);
          }
        },
      });
    } catch (err) {
      console.error("Error consuming messages:", err.message);
    }
  }
}

module.exports = KafkaConfig;
