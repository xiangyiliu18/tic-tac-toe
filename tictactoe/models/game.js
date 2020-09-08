const {mongoose} = require('../constants');

const Schema = mongoose.Schema;
const gameSchema = new Schema({
  id: { type: Number, required: true, index: true },
  start_date: { type: String, required: true },
  grid: { type: Array, required: false },
  winner: { type: String, required: false },
});

module.exports = Game = mongoose.model("Game", gameSchema);