const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  key: { type: String, required: true },
  active: { type: Boolean, required: false, default: false },
  human: { type: Number, required: true, default: 0 },
  wopr: { type: Number, required: true, default: 0 },
  tie: { type: Number, required: true, default: 0 },
  games: [{ type: "ObjectId", ref: "Game" }],
});
module.exports = User = mongoose.model("User", userSchema);
