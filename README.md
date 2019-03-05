# TicTacToe
REST APT with NodeJS

### Requirements
1. Create a REST-based Tic-Tac-Toe service at http://yourserver/ttt/play to take as input a JSON object including a ‘move’ property to indicate on which square (0-indexed, in reading order) the human is making a move in the current game.  What's more, the server should resonse with a JSON obejct that  includes a ‘grid’ property and a ‘winner’ property as in WP#1. Making a request with { move:null } should return the current grid without making a move. Once a winning or tying move has been sent to the server, the server should consider the game completed and reset the grid.
2. Develop a user-creation system validated with email
	1.  /adduser, { username:, password:, email: } --- create a disabled user
	2.  /verify, { email:, key: }
        1. key sent via email (backdoor key is “abracadabra”). Optionally, 
        2. also make this API call accept a GET request with the two parameters in the query string, to allow for a direct link from the verification email.
3. Add cookie-based session support
	1.  /login, {username:, password:}
	2.  /logout
4. Maintain the history of previously played games by each user on the server.
	1.  /listgames --- return JSON object: { status:”OK”, games:[ {id:, start_date:}, …] }
	2.  /getgame, {id: } --- return JSOB object: { status:”OK”, grid:[“X”,”O”,…], winner:”X” }
	3.  /getscore. --- get { status:”OK”, human:0, wopr: 5, tie: 10 }
5. all of the above API calls must be POST requests with a JSON object for the request and JSON object as a response of either { status:”OK” } or { status:”ERROR” } (unless otherwise specified).

### Notes
1. Install and Configure:  NodeJS, Apache2, MongoDB
2. Use 'nodemailer' to send key via email(Pay attention: if use gmail, need make your Google account with 'less secure apps' being on)
3. Use 'express-session' to support cookie-based session
4. Store games data into the DB
5. Can use 'crypto' to generate key. (I just use the default backdoor key)

