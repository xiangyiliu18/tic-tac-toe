const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema({
  id: { type: Number, required: false },
  start_date: { type: String, required: false },
  grid: { type: Array, required: false },
  winner: { type: String, required: false },
});
module.exports = Game = mongoose.model("Game", gameSchema);
