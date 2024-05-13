const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const transcode = require("./service/transcode.js");
const KafkaConfig = require("./kafka/kafka.js");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: "*",
  })
);
app.use(express.json());

const kafkaConfig = new KafkaConfig();
kafkaConfig.consume("transcode", async (value) => {
  console.log("got data from kafka: ", value);
  const { id, key, title, description, author } = JSON.parse(value);
  await transcode(id, key, title, description, author);
});

app.get("/", (req, res) => {
  res.send("HHLD Youtube transcoder service.");
});

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}`);
});
