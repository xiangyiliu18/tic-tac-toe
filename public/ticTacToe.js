var board = { 'grid': [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], 'move': null }
// 'move' conains a move made by human in curent game
// X --- human, O ----- wopr(computer)
const winnerCombo = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
]

$(document).ready(function () {
  $('#restart').hide()
  // initial board
  initialBoard()

  $('#logout').click(function () {
    $.ajax({
      type: 'POST',
      url: '/logout',
      success: function (res) {
        console.log('log Out: ' + res.status)
        if (res.status == 'OK') {
          alert('Log Out Successfully')
          window.location.href = 'http://130.245.168.101/login'
        } else if (res.status == 'ERROR') {
          alert('Log Out Failed')
        } else {
          alert('res.status problem in logout')
        }
      },
      error: function (res) {
        console.log('log Out:' + res.status)
      }
    })
  })

  $('#listgames').click(function () {
    $.ajax({
      type: 'POST',
      url: '/listgames',
      success: function (res) {
        console.log('listgames: ' + res.status)
        if (res.status == 'OK') {
          $('#content').text('List Games Reult: ' + JSON.stringify(res.games))
        } else if (res.status == 'ERROR') {
          $('#content').text('ERROR')
        } else {
          $('#content').text('res.status problem in listgames')
        }
        setTimeout(function () {
          $('#content').text('')
        }, 2000)
      },
      error: function (res) {
        console.log('listgames:' + res.status)
      }
    })
  })

  $('#getscore').click(function () {
    $.ajax({
      type: 'POST',
      url: '/getscore',
      success: function (res) {
        console.log('getscore: ' + res.status)
        if (res.status == 'OK') {
          $('#content').text('human: ' + res.human + ',' + 'wopr: ' + res.wopr + ',' + 'tie: ' + res.tie)
        } else if (res.status == 'ERROR') {
          $('#content').text('ERROR')
        } else {
          $('#content').text('res.status problem in getscore')
        }
        setTimeout(function () {
          $('#content').text('')
        }, 2000)
      },
      error: function (res) {
        console.log('getscore:' + res.status)
      }
    })
  })

  $('#getgame').submit(function (event) {
    event.preventDefault()
    // Ajax Post Call
    $.ajax({
      type: 'POST',
      url: '/getgame',
      dataType: 'json',
      data: JSON.stringify({
        id: $('#gameID').val()
      }),
      contentType: 'application/json',
      success: function (res) {
        console.log('getgame POST: ' + res.status)
        if (res.status == 'OK') {
          $('#content').text(JSON.stringify(res.grid) + '  winner: ' + res.winner)
        } else {
          $('#content').text('ERROR')
        }
        setTimeout(function () {
          $('#content').text('')
        }, 2000)
      },
      error: function (res) {
        console.log('Get game POST ' + res.status)
      }
    })
  })

  $('.box').click(function () {
    var boxId = $(this).attr('id')
    var boxVal = $(this).text()
    board.move = null

    // $index -- the index of the cell of the board
    var index = parseInt(boxId.replace('box', ''))
    // If not empty, do not need handle 'click' event
    if (boxVal != ' ') {
      console.log('Not empyt space at box# ' + index)
    } else { // make a move
      board.move = index
      console.log('Click X at box: ' + index + ' ' + board.move)
    }
    // Ajax Post Call
    $.ajax({
      type: 'POST',
      url: '/ttt/play',
      dataType: 'json',
      data: JSON.stringify(board),
      contentType: 'application/json',
      success: function (res) {
        // console.log('ttt/play status' + res.status)
        console.log('Success: current grid data is: ' + res.grid)
        console.log('Success: current winner data is: ' + res.winner)
        if (board.move == null) {
          console.log('Did not make any changes, because move is null')
        } else {
          var next_move = true
          refresh(res.grid)
          board.grid = res.grid
          var winner = res.winner
          if ((board.grid).indexOf(' ') <= -1) {
            console.log('tie')
            next_move = false
            $('#winner').text('The Game is Tie')
          } else {
            if (winner == 'X') {
              next_move = false
              $('#winner').text('Player X won')
            } else if (winner == 'O') {
              next_move = false
              $('#winner').text('Player O won')
            }
          }
          if (!next_move) {
            // game completed and reset the gird
            game_is_over()
            setTimeout(function () {
              $('#restart').trigger('click')
            }, 1000)
          }
        }
      },
      error: function (res) {
        console.log('ttt/play post call failed')
        // console.log('play post' + res.status)
      }
    })
  })

  $('#restart').click(function () {
    initialBoard()
    board = { 'grid': [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '] }
    $('#winner').text('')
    var i = 0
    for (i = 0; i < 9; i++) {
      $('#box' + i).css('pointer-events', 'auto')
    }
    $('#restart').hide()
  })
})

function initialBoard () {
  $('#content').text('')
  var i = 0
  for (i = 0; i < 9; i++) {
    // alert('here')
    $('#box' + i).text(' ')
  }
}

function refresh (grid) {
  var i = 0
  for (i = 0; i < 9; i++) {
    $('#box' + i).text(grid[i])
  }
}

function game_is_over () {
  var i = 0
  for (i = 0; i < 9; i++) {
    $('#box' + i).css('pointer-events', 'none')
  }
  $('#restart').show()
}
