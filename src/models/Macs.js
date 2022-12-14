const { Schema, model } = require("mongoose");

const Macs = new Schema({
  mac: { type: String, unique: true },
  confirm: {type: Number}
});

module.exports = model("Macs", Macs);
