/** ******** Import moduler  ***********/
const express = require('express')
const app = express()
// for solving relative path problem
const path = require('path')
// for html parsingParse HTTP request body
const bodyParser = require('body-parser')
const multer = require('multer')
// for connecting db
const mongoose = require('mongoose')
// for verifying email
const nodemailer = require('nodemailer')
// for cookie
const session = require('express-session')
// for generate key
const crypto = require('crypto')

/* ********************** Connect to MongoDB -- mongoose ********/
// Get Mongoose to use the gloabl promise library before mongoose V5
mongoose.Promise = global.Promise
// set up default mongoose connection -- localhost/ 127.0.0.1
mongoose.connect('mongodb://130.245.168.101:27017/project2')
// Create & Define a schema
var userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  key: { type: String, required: true },
  verify: { type: Boolean, required: false, default: false },
  human: { type: Number, required: true, default: 0 },
  wopr: { type: Number, required: true, default: 0 },
  tie: { type: Number, required: true, default: 0 },
  games: [
    {
      id: { type: Number, required: false },
      start_date: { type: String, required: false },
      grid: { type: Array, required: false },
      winner: { type: String, required: false }
    }
  ]
})

// Create User module for the created schema
var User = mongoose.model('User', userSchema)

/** *************** Use nodemailer for verfying email *************/
var smtpTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'cheryl123liu@gmail.com',
    pass: '630future52mm'
  }
})

/** ******************* APP PARTS ******************************/
app.use(express.static(path.join(__dirname, 'public')))
app.use(bodyParser.json()) // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}))
app.set('view engine', 'ejs')
// for cookies
app.use(session({
  secret: 'cheryl',
  resave: false,
  saveUninitialized: true
}))

/** ****** Global variable & helper methods *********/
var rand, mailOptions, host, link, mySession
name = ' '
var myDate = new Date().toISOString().slice(0, 10)

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

function get_boxes (board, player) {
  var boxes = []
  for (var i = 0; i < 9; i++) {
    if (board[i] == player) {
      boxes.push(i)
    }
  }
  return boxes
}

function check_win (board, player) {
  var boxes = get_boxes(board, player)
  if (boxes.length >= 3) {
    // console.log('check_win box: ' + boxes)
    for (var i = 0; i < winnerCombo.length; i++) {
      if (boxes.includes(winnerCombo[i][0]) && boxes.includes(winnerCombo[i][1]) && boxes.includes(winnerCombo[i][2])) {
        return player
      }
    }
  }
  return ' '
}

function miniMax (board, player) {
  // board --- data after human made, player: O
  var emptyBox = get_boxes(board, ' ')
  var temp_result = {}
  temp_result.index = -1
  // console.log('new: ' + board)
  if (check_win(board, 'X') == 'X') {
    temp_result.score = -10
    return temp_result
  } else if (check_win(board, 'O') == 'O') {
    temp_result.score = 10
    return temp_result
  } else if (emptyBox.length === 0) {
    temp_result.score = 0
    return temp_result
  }

  // console.log('not winner in miniMax')
  var moves = []
  // console.log('emptyBox.length ' + emptyBox.length)
  for (var i = 0; i < emptyBox.length; i++) {
    var move = {}
    move.index = emptyBox[i]
    board[emptyBox[i]] = player
    // console.log('new test board: ' + board)

    if (player == 'O') {
      move.score = miniMax(board, 'X').score
    } else {
      move.score = miniMax(board, 'O').score
    }
    // console.log('single move: ' + move)
    board[emptyBox[i]] = ' '
    if ((player == 'X' && move.score === (-10)) || player === 'O' && move.score === (10)) {
      return move
    } else {
      moves.push(move)
    }
  }

  var iScore, bestMove
  if (player === 'O') {
    iScore = -10000
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score > iScore) {
        iScore = moves[i].score
        bestMove = i
      }
    }
  } else {
    iScore = 10000
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].score < iScore) {
        iScore = moves[i].score
        bestMove = i
      }
    }
  }
  // console.log('bestMove: ' + ' iScore: ' + iScore)
  return moves[bestMove]
}

// ######################################################### GET && POST #########################################################
app.get('/', (req, res) => {
  res.send('Hi, This is my homepage')
})

// link verification
app.get('/verify', (req, res) => {
  if (Object.keys(req.query).length > 0) {
    // With key and email query string;   // req.protocol --- http
    User.updateMany({ email: req.query.email, key: req.query.key }, { $set: { verify: true } })
      .then((docs) => {
        // find the specify user and make modified
        if ((docs.n > 0) && (docs.nModified > 0)) {
          res.redirect('/login')
          // res.json({ status: 'OK' })
        } else {
          res.json({ status: 'ERROR' })
        }
      }).catch((err) => {
        res.json({ status: 'ERROR' })
      })
  } else {
    res.render(path.join(__dirname, 'public/verify'))
  }
})

// Verify -- Post --- return: {status:'OK'} or {status: 'ERROR'}}
app.post('/verify', (req, res) => {
  // req.protocol --- http
  User.updateMany({ email: req.body.email, key: req.body.key }, { $set: { verify: true } })
    .then((docs) => {
      // find the specify user and make modified
      if ((docs.n > 0) && (docs.nModified > 0)) {
        res.json({ status: 'OK' })
      } else {
        res.json({ status: 'ERROR' })
      }
    }).catch((err) => {
      res.json({ status: 'ERROR' })
    })
})

// Create a disabled user ---- GET
app.get('/adduser', (req, res) => {
  res.render(path.join(__dirname, 'public/create'))
})

/// / AddUser -- Post --- return: {status:'OK'} or {status: 'ERROR'}}
app.post('/adduser', (req, res) => {
  rand = crypto.randomBytes(5).toString('hex') // Generate key
  var newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    key: rand
  }) // Instantiate one user with json data

  newUser.save()
    .then(item => {
      // verify email through randomly generating one key
      host = req.get('host') // like localhost:3000/
      link = 'http://' + host + '/verify?email=' + req.body.email + '&key=' + rand
      mailOptions = {
        to: req.body.email,
        subject: 'Email Confirmation',
        html: '<h3> Email Comfirmation Page for Tic-Tac-Toe Game:</h3><hr><br> Hi, New User:<br><br> <p> You key is: ' + rand + '</p><br><br><p> Please Click on the following link to verify your email <p><br> <a href=' + link + '>Click here to verify, please</a>'
      }

      smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
          console.log('Send email error')
          res.json({ status: 'ERROR' })
        } else {
          res.json({ status: 'OK' })
        }
      })
    }).catch(err => {
      rand = ''
      res.json({ status: 'ERROR' })
    })
})

app.get('/login', (req, res) => {
  // Go to Login Page
  mySession = req.session
  if (mySession.username) { // check if logged user
    res.redirect('/ttt')
  } else { // need to login in
    res.render(path.join(__dirname, 'public/login'))
  }
})

// Login -- Post --- return: {status:'OK'} or {status: 'ERROR'}}
app.post('/login', (req, res) => {
  mySession = req.session
  User.find({
    username: req.body.username,
    password: req.body.password,
    verify: 'true'
  }).then((docs) => {
    if (docs.length > 0) {
      mySession.username = req.body.username
      res.json({ status: 'OK' })
    } else {
      res.json({ status: 'ERROR' })
    }
  }).catch((err) => {
    res.json({ status: 'ERROR' })
  })
})

// Logout -- Post --- return: {status:'OK'} or {status: 'ERROR'}}
app.post('/logout', (req, res) => {
  req.session.destroy(function (err) {
    if (err) {
      console.log(err)
      res.json({ status: 'ERROR' })
    } else {
      res.json({ status: 'OK' })
    }
  })
})

/** ******************** Game Parts *******************************/
app.get('/ttt', (req, res) => {
  mySession = req.session
  if (mySession.username) {
    res.render(path.join(__dirname, 'public/ticTacToe'), { name: mySession.username, myDate: myDate })
  } else {
    // Need to log in firstly
    res.redirect('/login')
  }
})

app.post('/ttt/play', (req, res) => {
  mySession = req.session
  if (mySession.username) {
  // Get javascript object from the Json data
    if (!mySession.grid) {
      mySession.grid = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
      mySession.winner = ' '
    }
    var final_board = { 'grid': [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '], 'winner': ' ' }
    var human_move = req.body.move
    if (human_move == null || (mySession.grid[human_move] != ' ')) {
      // return the current grid without making a move
      final_board.grid = mySession.grid
      final_board.winner = mySession.winner
      res.json(final_board)
    } else {
      // Human makes a move
      console.log('init_board move data: ' + req.body.move)
      mySession.grid[human_move] = 'X'
      console.log('init_board grid data: ' + mySession.grid)
      var init_board = mySession.grid
      var board = mySession.grid// ['X',' ','O'.....]
      var winner = ' '
      var need_move = true
      var result_move = miniMax(board, 'O')

      if (check_win(board, 'X') == 'X') {
        winner = 'X'
        need_move = false
      } else if (check_win(board, 'O') == 'O') {
        winner = 'O'
        need_move = false
      } else if ((get_boxes(board, ' ')).length === 0) {
        need_move = false
      }
      console.log('My result_move: ', result_move)

      if (need_move) {
        init_board[result_move.index] = 'O'
      }
      if (check_win(board, 'X') == 'X') {
        winner = 'X'
      } else if (check_win(board, 'O') == 'O') {
        winner = 'O'
      }
      if ((winner != ' ') || ((get_boxes(init_board, ' ')).length === 0)) {
        // 'X' or 'O' wins or the game ties
        var count_games = 0
        var count_winner = 0
        var get_winner = 'tie'

        User.find({ username: mySession.username }, 'human wopr tie games', function (err, docs) {
          if (err) { console.log('query error: ' + err) } else {
            console.log('query docs: ' + docs)
            count_games = docs[0].games.length + 1
            if (winner == 'X') {
              get_winner = 'human'
              count_winner = docs[0].human + 1
            } else if (winner == 'O') {
              get_winner = 'wopr'
              count_winner = docs[0].wopr + 1
            } else {
              count_winner = docs[0].tie + 1
            }
            game = { id: count_games, start_date: myDate, grid: init_board, winner: winner }
            console.log('winner: ' + get_winner + ': ' + count_winner)
            var winner_update = {}
            winner_update[get_winner] = count_winner
            User.updateMany({ username: mySession.username }, { $push: { games: game }, $set: winner_update })
              .then((sub_docs) => {
                // find the specify user and make modified
                if ((sub_docs.n > 0) && (sub_docs.nModified > 0)) {
                  console.log('push && modified')
                } else {
                  console.log('push && modified failed')
                }
              }).catch((err) => {
                console.log('updated failed : ' + err)
              })
          }
        })
      }
      final_board.grid = init_board
      mySession.grid = init_board
      mySession.winner = winner
      final_board.winner = winner
      // console.log('My return board is: ' + JSON.stringify(final_board))
      res.json(final_board)
    }
  } else {
    res.redirect('/login')
  }
})

app.post('/listgames', (req, res) => {
  mySession = req.session
  if (mySession.username) {
    User.find({ username: mySession.username }, 'games', function (err, docs) {
      if (err) {
        console.log('query error: ' + err)
        res.json({ status: 'ERROR' })
      } else {
        // console.log(docs[0].games.length)
        var result = []
        if (docs[0].games.length === 0) {
          res.json({ status: 'OK', games: result })
        } else {
          (docs[0].games).forEach(function (ele) {
            result.push({ id: ele.id, start_date: ele.start_date })
          })
          res.json({ status: 'OK', games: result })
        }
      }
    })
  } else { res.redirect('/login') }
})

app.post('/getgame', (req, res) => {
  mySession = req.session
  if (mySession.username) {
    User.find({ username: mySession.username }, 'games', function (err, docs) {
      if (err) {
        console.log('query error: ' + err)
        res.json({ status: 'ERROR' })
      } else {
        var result = []
        if (docs[0].games.length === 0) {
          res.json({ status: 'ERROR' })
        } else {
          (docs[0].games).forEach(function (ele) {
            if (parseInt(ele.id) == parseInt(req.body.id)) {
              result.push({ status: 'OK', grid: ele.grid, winner: ele.winner })
              res.json(result[0])
            }
          })

          if (result.length === 0) { res.json({ status: 'ERROR' }) }
        }
        //     all_games.forEach(function (ele) {
        //       // var myId = Integer.parseInt(ele.id)
        //       if (ele.id === gameID) {
        //         res.json({ status: 'OK', gird: ele.grid, winner: ele.winner })
        //       }
        //     })
        //     res.json({ status: 'ERROR' })
      }
    })
  } else { res.redirect('/login') }
})

app.post('/getscore', (req, res) => {
  mySession = req.session
  if (mySession.username) {
    User.find({ username: mySession.username }, 'human wopr tie', function (err, docs) {
      if (err) {
        console.log('query error: ' + err)
        res.json({ status: 'ERROR' })
      } else { res.json({ status: 'OK', human: docs[0].human, wopr: docs[0].wopr, tie: docs[0].tie }) }
    })
  } else { res.redirect('/login') }
})

app.listen(3000, () => console.log('Listening to 30000'))
