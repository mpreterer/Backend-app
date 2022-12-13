const { Schema, model } = require("mongoose");

const Guest = new Schema({
  login: { type: String, required: true },
  guest: { type: Number, default: 1, required: true },
  role: { type: String, ref: "Role" },
});

module.exports = model("Guest", Guest);
