const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const uploadRouter = require("./routes/upload.route.js");
const kafkaPublisherRouter = require("./routes/kafkapublisher.route.js");
const {
  updateVideoMetaData,
} = require("./controllers/videometadata.update.js");
const KafkaConfig = require("./kafka/kafka.js");

dotenv.config();
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: "*",
  })
);

const kafkaConfig = new KafkaConfig();
kafkaConfig.consume("update", async (value) => {
  console.log("got data from kafka: ", value);
  const { id, key, title, description, author, transcodedUrl } =
    JSON.parse(value);
  await updateVideoMetaData(id, transcodedUrl);
});

app.use("/upload", uploadRouter);
app.use("/publish", kafkaPublisherRouter);

app.get("/", (req, res) => {
  res.send("HHLD Youtube upload service");
});

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}`);
});
