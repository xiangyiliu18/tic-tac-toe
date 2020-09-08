const X_MOVE = "X"; // Human
const O_MOVE = "O"; // Computer
const OK_STATUS = "OK";
const ERROR_STATUS = "ERROR";
const EMPTY_BOX = " ";
const EMPTY_GRID = [
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
  EMPTY_BOX,
];
const board = {
  grid: [...EMPTY_GRID],
  move: null, //conains a move made by human in curent game
};
// X --- human, O ----- wopr(computer)
const winnerCombo = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];
let winner = "";

$(document).ready(function () {
  displayDateTime();

  // Initialize/Load the play board
  const currGame = $("#curr-game").val();
  currGame ? loadBoard(JSON.parse(currGame)) : drawBoard();

  // Event binding for staring a new game
  $("#new-btn").click(() => {
    window.location.href = `${window.location.origin}/games`;
    return;
  });
  // Event binding for saving a new game
  $("#save-btn").click(() => {
    saveHandler();
  });
  // Even handler for box clicking
  $(".box").click(function () {
    const boxId = $(this).attr("id");
    const boxIndex = parseInt(boxId.replace("box-", ""));
    const boxVal = $(this).text();
    moveHandler(boxIndex, boxVal);
  });

  // Even handlerfor the logout
  $("#log-out").click(() => {
    $.ajax({
      type: "POST",
      url: "/logout",
      success: (res) => {
        if (res.status == OK_STATUS) {
          window.location.href = `${window.location.origin}/login`;
        }
        if (res.status == ERROR_STATUS) {
          alert(res.error);
        }
      },
      error: (err) => {
        console.error(`Faield to log out due to ${JSON.stringify(err)}`);
      },
    });
  });
});

function getGame(gameId) {
  window.location.href = `${window.location.origin}/games/${gameId}`;
}

// Helper methods
function displayDateTime() {
  // Display datetime in real
  setInterval(() => {
    const date = new Date();
    $("#date-display").text(date.toLocaleString());
  });
}

function saveHandler() {
  $.ajax({
    type: "POST",
    url: "/games/save",
    dataType: "json",
    data: JSON.stringify({
      grid: board.grid,
      winner,
    }),
    contentType: "application/json",
    success: (res) => {
      if (res.status === OK_STATUS) {
        // After saved, reloading the page
        window.location.href = `${window.location.origin}/games`;
      }
      if (res.status === ERROR_STATUS) {
        alert(res.error);
      }
    },
    error: (err) => {
      console.error(`Server Error: ${JSON.stringify(err)}`);
    },
  });
}

function moveHandler(boxIndex, boxVal) {
  if (boxVal !== EMPTY_BOX) {
    return;
  }
  board.move = boxIndex;
  $.ajax({
    type: "POST",
    url: "/games/move",
    dataType: "json",
    data: JSON.stringify(board),
    contentType: "application/json",
    success: (res) => {
      let nextMove = false;
      board.grid = res.grid;
      winner = res.winner;
      drawBoard(board.grid);
      if (winner === "human") {
        $("#winner").text("You Won!");
      } else if (winner === "wopr") {
        $("#winner").text("Computer Won!");
      } else if (winner === "tie" || board.grid.indexOf(EMPTY_BOX) <= -1) {
        winner = "tie";
        $("#winner").text("The Game is Tie");
      } else {
        nextMove = true;
      }
      if (!nextMove) {
        gameOver();
      }
    },
    error: (err) => {
      console.error(`Server Error: ${JSON.stringify(err)}`);
    },
  });
}

function drawBoard(grid = EMPTY_GRID) {
  if (grid === EMPTY_GRID) {
    $("#save-btn").prop("disabled", true); // Disabled Save button
    board.grid = [...EMPTY_GRID];
    board.move = null;
    winner = "";
  }
  $("#winner").text(winner);
  for (let i = 0; i < grid.length; i++) {
    $("#box-" + i).text(grid[i]);
  }
}

function loadBoard(currGame) {
  $.each($(".box"), function () {
    $(this).css("pointer-events", "none");
  });
  $("#save-btn").prop("disabled", true); // Disabled Save button
  board.grid = currGame.grid;
  winner = currGame.winner;
  $("#winner").text(winner);
  for (let i = 0; i < board.grid.length; i++) {
    $("#box-" + i).text(board.grid[i]);
  }
}

function gameOver() {
  $.each($(".box"), function () {
    $(this).css("pointer-events", "none");
  });
  $("#save-btn").prop("disabled", false); // Enable Save button
}
