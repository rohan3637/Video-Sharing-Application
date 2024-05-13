const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const watchRouter = require("./routes/watch.route.js");

dotenv.config();
const PORT = process.env.PORT || 5002;

const app = express();
app.use(
  cors({
    allowedHeaders: ["*"],
    origin: "*",
  })
);
app.use(express.json());
app.use("/watch", watchRouter);

app.get("/", (req, res) => {
  res.send("HHLD Youtube Watch Service");
});

app.listen(PORT, () => {
  console.log(`Server is listening at PORT: ${PORT}`);
});
