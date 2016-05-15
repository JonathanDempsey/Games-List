var express = require('express'),		//Creates a route to express @ package.json
    game = require('./routes/games');	//Creates a route to games.js

var app = express();	//Initiates Express as variable 'app'

app.use(express.logger('dev'));					//Request logger middleware for node.js
app.use(express.static(__dirname + '/public'));	//Serves files from the '/public' directory
app.use(express.bodyParser());					//Allows middleware to populate the req.body porperty

app.get('/games', game.findAll);			//Gets all games
app.get('/games/:id', game.findById);		//Gets a game by id
app.post('/games', game.addGame);			//Adds a game
app.put('/games/:id', game.updateGame);		//Updates a game
app.delete('/games/:id', game.deleteGame);	//Deletes a game

app.listen(3000);							//Opens port 3000
console.log('Listening on port 3000...');