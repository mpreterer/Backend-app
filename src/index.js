const express = require("express");
const mongoose = require("mongoose");
const authRouter = require("./authRouter.js");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use("/auth", authRouter);

const start = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect("mongodb+srv://user:user1234@cluster0.qgytpnx.mongodb.net/?retryWrites=true&w=majority");
    app.listen(PORT, () => console.log(`CONNECT ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();
