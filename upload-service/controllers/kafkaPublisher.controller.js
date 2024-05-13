const KafkaConfig = require("../kafka/kafka.js");

const publishMessageToKafka = async (id, key, title, description, author) => {
  try {
    const msg = {
      id: id,
      key: key,
      title: title,
      description: description,
      author: author,
    };
    const kafkaConfig = new KafkaConfig();
    const messages = [
      {
        key: "transcode",
        value: JSON.stringify(msg),
      },
    ];
    console.log("publishing message to transcode topic");
    await kafkaConfig.produce("transcode", messages);
  } catch (err) {
    console.log("Failed to publish messages to Kafka. " + err.message);
  }
};

module.exports = publishMessageToKafka;
