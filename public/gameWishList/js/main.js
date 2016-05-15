/***********
	MODEL
***********/

//Creates a model for single obejcts
window.Game = Backbone.Model.extend({
    idAttribute: "_id",
    urlRoot:"http://localhost:3000/games",
    defaults:{
        "_id":null,
        "name":"Default",
        "publisher":"2K Games",
        "console":"Xbox",
        "price":"49.99",
        "releaseDate":"March 20, 2014",
        "description":"...",
        "picture":""
    }
});

//Creates a model for the collection of single objects
window.GameCollection = Backbone.Collection.extend({
    model:Game,
    url:"http://localhost:3000/games"
});

/***********
	VIEW
***********/

//Parent ( ul ) is initialised and rendered first so that
//any elements the child views depend on already exist. 
//An element is passed into the parent to determine what the child 
//view is allowed to input.
window.GameListView = Backbone.View.extend({

    tagName:'ul',

    initialize:function () {
        this.model.bind("reset", this.render, this);
        var self = this;
        this.model.bind("add", function (game) {
            $(self.el).append(new GameListItemView({model:game}).render().el);
        });
    },

    render:function (eventName) {
        _.each(this.model.models, function (game) {
            $(this.el).append(new GameListItemView({model:game}).render().el);
        }, this);
        return this;
    }
});

//The child views are then initialised and rendered. 
//The binds used in the initialiser means that render doesn’t need to 
//be called manually, as the model block will re-render itself if it 
//detects any change and won’t affect other views. The child also contains a close, which 
//will unbind and remove and element from the model  
window.GameListItemView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#tpl-game-list-item').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).remove();
    }
});

//Game details template
window.GameView = Backbone.View.extend({

    template:_.template($('#tpl-game-details').html()),

    initialize:function () {
        this.model.bind("change", this.render, this);
    },

    render:function (eventName) {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

	//Creates events
    events:{
        "change input":"change",
        "click .save":"saveGame",
        "click .delete":"deleteGame"
    },

	//The change function allows the model to be changed on the go through console commands 
    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
    },

	//The save function allows the model object to be updated 
	//and allows new ones to be added to the database. 
    saveGame:function () {
        this.model.set({
            name:$('#name').val(),
            publisher:$('#publisher').val(),
            console:$('#console').val(),
            price:$('#price').val(),
            releaseDate:$('#releaseDate').val(),
            description:$('#description').val()
        });
        if (this.model.isNew()) {
            var self = this;
            app.gameList.create(this.model, {
                success:function () {
                    app.navigate('games/' + self.model.id, false);
                }
            });
        } else {
            this.model.save();
        }

        return false;
    },

	//The delete function will remove objects from the database. 
	//When on the specific object, when delete button is clicked, .destroy is used 
	//to remove the selected model object. 
    deleteGame:function () {
        this.model.destroy({
            success:function () {
                alert('Game deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    close:function () {
        $(this.el).unbind();
        $(this.el).empty();
    }
});

//Header template
window.HeaderView = Backbone.View.extend({

    template:_.template($('#tpl-header').html()),

    initialize:function () {
        this.render();
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events:{
        "click .new":"newGame"
    },

	//A new view is created for the new function and follows the
	//same general structure as the game detail view. 
    newGame:function (event) {
        app.navigate("games/new", true);
        return false;
    }
});


/***********
	ROUTERS
***********/
var AppRouter = Backbone.Router.extend({

	//Creates three routes
    routes:{
        "":"list",
        "games/new":"newGame",
        "games/:id":"gameDetails"
    },

    initialize:function () {
        $('#header').html(new HeaderView().render().el);
    },

	//renders data from ‘gamelist’ into the ‘sidebar’ element in the html. 
	//Backbone first creates a new GameCollection(); and then uses fetch() to 
	//render the fetched data from the database into the HTML element ‘sidebar’ 
    list:function () {
        this.gameList = new GameCollection();
        var self = this;
        this.gameList.fetch({
		reset: true,
            success:function () {
                self.gameListView = new GameListView({model:self.gameList});
                $('#sidebar').html(self.gameListView.render().el);
                if (self.requestedId) self.gameDetails(self.requestedId);
            }
        });
    },

	//function loads the details about the selected game into the ‘content’ element in the HTML. 
	//The functions passes the id parameter which reads the id of the 
	//selected object in the sidebar, sends a get request the retrieve additional 
	//data (such as price, publisher and image) relevant to that id, and then renders that data 
	//into the ‘content’ element 
    gameDetails:function (id) {
        if (this.gameList) {
            this.game = this.gameList.get(id);
            if (this.gameView) this.gameView.close();
            this.gameView = new GameView({model:this.game});
            $('#content').html(this.gameView.render().el);
        } else {
            this.requestedId = id;
            this.list();
        }
    },

	//used to add new objects. It closes the game details view from the ‘content’ 
	//element and renders in the default model which was defined at the beginning of 
	//the file into the content element instead 
    newGame:function () {
        if (app.gameView) app.gameView.close();
        app.gameView = new GameView({model:new Game()});
        $('#content').html(app.gameView.render().el);
    }

});

var app = new AppRouter();
Backbone.history.start();