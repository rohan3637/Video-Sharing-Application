const KafkaConfig = require("../kafka/kafka.js");

const publishUpdateMessageToKafka = async (
  id,
  title,
  description,
  author,
  transcodedUrl
) => {
  try {
    const msg = {
      id: id,
      title: title,
      description: description,
      author: author,
      transcodedUrl: transcodedUrl,
    };
    const kafkaConfig = new KafkaConfig();
    const messages = [
      {
        key: "update",
        value: JSON.stringify(msg),
      },
    ];
    console.log("reached here...publish to update topic now..");
    await kafkaConfig.produce("update", messages);
  } catch (err) {
    console.log("Failed to publish messages to Kafka. " + err.message);
  }
};

module.exports = publishUpdateMessageToKafka;
