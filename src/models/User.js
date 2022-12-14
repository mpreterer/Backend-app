const { Schema, model } = require("mongoose");

const User = new Schema({
  phone: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  uname: { type: String, required: true},
  role: { type: String, ref: "Role" },
  guest: { type: Number, default: 0 },
  status: {type: String, default: 'offline'},
  date: {type: String, default: ''},
});

module.exports = model("User", User);
