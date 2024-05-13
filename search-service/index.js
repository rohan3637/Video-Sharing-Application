const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const KafkaConfig = require("./kafka/kafka.js");
const publishToOpenSearch = require("./opensearch/pushToOpenSearch.js");
const searchRoute = require("./routes/search.route.js");

dotenv.config();
const PORT = process.env.PORT || 5004;

const app = express();
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: "*",
  })
);
app.use(express.json());

const kafkaConfig = new KafkaConfig();
kafkaConfig.consume("update", async (value) => {
  console.log("got data from kafka: ", value);
  const { id, title, description, author, transcodedUrl } = JSON.parse(value);
  await publishToOpenSearch(id, title, description, author, transcodedUrl);
});

app.use("/search", searchRoute);

app.get("/", (req, res) => {
  res.send("HHLD Youtube transcoder service.");
});

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}`);
});
