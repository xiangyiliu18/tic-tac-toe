const { router, ERROR_STATUS, OK_STATUS } = require("../constants");
const Logger = require("./logger-controller");
const User = require("../models/user");
const Game = require("../models/game");
// Constants
const EMPTY_GRID = [" ", " ", " ", " ", " ", " ", " ", " ", " "];
const WINNER_COMBO = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
const X_MOVE = "X";
const O_MOVE = "O";
const HUMAN_WINNER = "human";
const WOPR_WINNER = "wopr";
const TIE_WINNER = "tie";

//  Routing: /games
router.get("/", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Need Log In
  }
  req.session.grid = null;
  const user = await User.findOne({ email: req.session.user.email }).populate('games');
  res.render("game", {
    user: req.session.user,
    games: user.games,
    currGame: null,
  });
});

// Routing: /games/:id
router.get("/:id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Need Log In
  }
  const gameId = req.params.id;
  if (!gameId) {
    return res.json({ status: ERROR_STATUS, error: "Need Game ID." });
  }

  try {
    const { email } = req.session.user;
    const user =  await User.findOne({ email }).populate('games'); // Get logged in user
    if (!user) {
      return res.redirect("/302");
    }
    const gameData = user.games.find((game) => (game.id == gameId));
    if (gameData) {
        return res.render("game", {
          user: req.session.user,
          games: user.games,
          currGame: gameData,
        });
    }
    res.redirect("/404");
  } catch (err) {
    Logger.error(
      `Failed to get the Game data with ID: ${gameId} due to ${JSON.stringify(
        err
      )}`
    );
    return res.redirect("/302");
  }
});

// Routing: /games/move
router.post("/move", async (req, res) => {
  const currSession = req.session;
  if (!currSession.user) {
    return res.redirect("/login"); // Need to Log In
  }
  if (!currSession.grid) {
    // Initialize grid in the current session if not
    currSession.grid = [...EMPTY_GRID];
    currSession.winner = "";
  }
  const humanMoveIndex = req.body.move;
  if (
    humanMoveIndex === null ||
    humanMoveIndex < 0 ||
    currSession.grid[humanMoveIndex] !== " "
  ) {
    // Not able to move
    return res.json({
      status: ERROR_STATUS,
      error: "Not able to move.",
    });
  }

  currSession.grid[humanMoveIndex] = X_MOVE;
  let currentBoard = currSession.grid;
  const resultMove = minMax(currentBoard, O_MOVE);
  let needMove = false; // Tracking if Computer need to move
  let winner = "";
  if (checkWin(currentBoard, X_MOVE) === X_MOVE) {
    winner = HUMAN_WINNER;
  } else if (checkWin(currentBoard, O_MOVE) === O_MOVE) {
    winner = WOPR_WINNER;
  } else if (getBoxes(currentBoard, " ").length === 0) {
    winner = TIE_WINNER;
  } else {
    needMove = true;
  }

  if (needMove) {
    // For Computer player
    currSession.grid[resultMove.index] = O_MOVE;
    currentBoard = currSession.grid;
    if (checkWin(currentBoard, X_MOVE) === X_MOVE) {
      winner = HUMAN_WINNER;
    } else if (checkWin(currentBoard, O_MOVE) === O_MOVE) {
      winner = WOPR_WINNER;
    } else if (getBoxes(currentBoard, " ").length === 0) {
      winner = TIE_WINNER;
    }
  }
  return res.json({ status: OK_STATUS, grid: currSession.grid, winner });
});

router.post("/save", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login"); // Need Log In
  }
  const { email } = req.session.user;
  try {
    const user = await User.findOne({ email }, "human wopr tie games");
    if (!user) {
      return res.json({
        status: ERROR_STATUS,
        error: `Did not find the user with email: ${email}`,
      });
    }
    Logger.info("Start saving Game data...");
    const nextGameId = user.games.length + 1;
    const { grid, winner } = req.body;
    let winCounts = 1;
    switch (winner) {
      case HUMAN_WINNER:
        winCounts += user.human;
        break;
      case WOPR_WINNER:
        winCounts += user.wopr;
        break;
      default:
        winCounts += user.tie;
        break;
    }
    const newGame = new Game({
      id: Number(nextGameId),
      start_date: new Date().toISOString().slice(0, 10),
      grid,
      winner,
    });
    await newGame.save();
    user.games.push(newGame);
    user[winner] = winCounts;
    await user.save();
    res.json({ status: OK_STATUS });
  } catch (err) {
    Logger.error(`Failed to save game data due to ${JSON.stringify(err)}`);
    return res.json({
      status: ERROR_STATUS,
      error: "Failed to save game data due to server error.",
    });
  }
});

function getBoxes(board, player) {
  const boxes = [];
  for (let i = 0; i < 9; i++) {
    if (board[i] == player) {
      boxes.push(i);
    }
  }
  return boxes;
}

function checkWin(board, player) {
  const boxes = getBoxes(board, player);
  if (boxes.length >= 3) {
    for (var i = 0; i < WINNER_COMBO.length; i++) {
      if (
        boxes.includes(WINNER_COMBO[i][0]) &&
        boxes.includes(WINNER_COMBO[i][1]) &&
        boxes.includes(WINNER_COMBO[i][2])
      ) {
        return player;
      }
    }
  }
  return " ";
}

// In order to let Computer player to win
function minMax(board, player) {
  const emptyBox = getBoxes(board, " ");
  const tempResult = {};
  tempResult.index = -1;
  if (checkWin(board, X_MOVE) === X_MOVE) {
    tempResult.score = -10;
    return tempResult;
  } else if (checkWin(board, O_MOVE) == O_MOVE) {
    tempResult.score = 10;
    return tempResult;
  } else if (emptyBox.length === 0) {
    tempResult.score = 0;
    return tempResult;
  }

  const moves = [];
  for (let i = 0; i < emptyBox.length; i++) {
    const move = {};
    move.index = emptyBox[i];
    board[emptyBox[i]] = player;

    if (player == "O") {
      move.score = minMax(board, X_MOVE).score;
    } else {
      move.score = minMax(board, O_MOVE).score;
    }

    board[emptyBox[i]] = " ";
    if (
      (player === X_MOVE && move.score === -10) ||
      (player === O_MOVE && move.score === 10)
    ) {
      return move;
    } else {
      moves.push(move);
    }
  }

  let iScore, bestMove;
  if (player === O_MOVE) {
    iScore = -10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > iScore) {
        iScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    iScore = 10000;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < iScore) {
        iScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  return moves[bestMove];
}
module.exports = router;
