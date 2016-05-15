var mongo = require('mongodb');	//Creates a route to MongoDB
var bson = require('bson');		//Creates a route to BSON

//Variable shorthands for Mongo and BSON
var Server = mongo.Server,
    Db = mongo.Db,
    BSON = bson.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});//Creates variable for new localhost server
db = new Db('gamedb', server);										//Creates variable for game database with the server

//If there is no error, open the database
//If the database is empty, populate the database with sample data
db.open(function(err, db) {
    if(!err) {
        console.log("Connected to 'gamedb' database");
        db.collection('games', {strict:true}, function(err, collection) {
            if (err) {
                console.log("The 'games' collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

//findById function
//Passes two parameters to request and respond
//Uses .findOne() to find the object as a BSON
//Requests the object id, Responds with the object
exports.findById = function(req, res) {
    var id = req.params.id;
    console.log('Retrieving game: ' + id);
    db.collection('games', function(err, collection) {
        collection.findOne({'_id':new BSON.ObjectID(id)}, function(err, item) {
            res.send(item);
        });
    });
};

//findAll function
//Passes two parameters to request and respond
//Uses .find() to get an array of objects
//No requests, only responds with an array of objects
exports.findAll = function(req, res) {
    db.collection('games', function(err, collection) {
        collection.find().toArray(function(err, items) {
            res.send(items);
        });
    });
};

//addGame function
//Passes two parameters to request and respond
//Uses .insert() to add an object to the database
//Requests the body, responds with a JSON of the added object or an error message
exports.addGame = function(req, res) {
    var game = req.body;
    console.log('Adding game: ' + JSON.stringify(game));
    db.collection('games', function(err, collection) {
        collection.insert(game, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred'});
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

//updateGame function
//Passes two parameters to request and respond
//Uses .update() to find the object id in BSON to be updated
//Requests the objects id and the body, responds with the updated object or an error message
exports.updateGame = function(req, res) {
    var id = req.params.id;
    var game = req.body;
    console.log('Updating game: ' + id);
    console.log(JSON.stringify(game));
    db.collection('games', function(err, collection) {
        collection.update({'_id':new BSON.ObjectID(id)}, game, {safe:true}, function(err, result) {
            if (err) {
                console.log('Error updating game: ' + err);
                res.send({'error':'An error has occurred'});
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(game);
            }
        });
    });
}

//deleteGame function
//Passes two parameters to request and respond
//Uses .remove() to find the object id in BSON to be removed from the database
//Requests the objects id and 
exports.deleteGame = function(req, res) {
    var id = req.params.id;
    console.log('Deleting game: ' + id);
    db.collection('games', function(err, collection) {
        collection.remove({'_id':new BSON.ObjectID(id)}, {safe:true}, function(err, result) {
            if (err) {
                res.send({'error':'An error has occurred - ' + err});
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/*--------------------------------------------------------------------------------------------------------------------*/
// Populate database with sample data -- Only used once: the first time the application is started.
// You'd typically not find this code in a real-life app, since the database would already exist.
var populateDB = function() {

    var games = [
    {
        name: "Bioshock Infinite",
        releaseDate: "March 26, 2013",
        publisher: "Irrational Games, 2K Marin, Aspyr Media, Inc., 2K Australia",
        console: "PlayStation 3, Xbox 360, Microsoft Windows, Linux, Mac OS",
        price: "49.99",
        description: "...",
        picture: "Bioshock Infinite.jpg"
    },
    {
        name: "XCOM 2",
        releaseDate: "February 5, 2016",
        publisher: "Firaxis Games",
        console: "Microsoft Windows, Linux, Mac OS",
        price: "49.99",
        description: "...",
        picture: "XCOM2.jpg"
    }];

    db.collection('games', function(err, collection) {
        collection.insert(games, {safe:true}, function(err, result) {});
    });

};