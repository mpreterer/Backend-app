const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./authRouter.js");
const PORT = process.env.PORT || 5000;
const connectBD = process.env.MONGO_DB_CONNECTION || '';

const app = express();

app.use(express.json());
app.use("/auth", authRouter);

const start = async () => {
  try {
    await mongoose.connect(connectBD);
    app.listen(PORT, () => console.log(`CONNECT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
