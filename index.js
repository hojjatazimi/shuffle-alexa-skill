var express = require("express");
var alexa = require("alexa-app");

var PORT = process.env.PORT || 8080;
var app = express();

var MUSICS = [];
var INDEXES = [];

const methods = require('./methods')

// ALWAYS setup the alexa app and attach it to express before anything else.
var alexaApp = new alexa.app("shuffle");

alexaApp.express({
  expressApp: app,
  //router: express.Router(),

  // verifies requests come from amazon alexa. Must be enabled for production.
  // You can disable this if you're running a dev environment and want to POST
  // things to test behavior. enabled by default.
  
  checkCert: false,
  // sets up a GET route when set to true. This is handy for testing in
  // development, but not recommended for production. disabled by default
  debug: true
});

// now POST calls to /test in express will be handled by the app.request() function

// from here on you can setup any other express routes or middlewares as normal
app.set("view engine", "ejs");

alexaApp.launch(function(request, response) {
  const user_id = request.data.session.userId;
  INDEXES[user_id] = 0;
  methods.getMusics(function(res){
    MUSICS[user_id] = res.tracks;
  });

  response.say("Hi, Welcome To Shuffle.");
});

alexaApp.intent('playChannel', function(req, res){
  const stream ={
    "url": "http://sv.blogmusic.ir/myahang/Shahram-Shokoohi-Akharin-Negah-128.mp3",
  };
  res.audioPlayerPlayStream("REPLACE_ALL", stream);
})


alexaApp.intent("nameIntent", {
    "slots": { "NAME": "LITERAL" },
    "utterances": [
      "my {name is|name's} {names|NAME}", "set my name to {names|NAME}"
    ]
  },
  function(request, response) {
    console.log('hojjat_shuffle');
    console.log(JSON.stringify(request));
    response.say("Success!");
  }
);




app.listen(PORT, () => console.log("Listening on port " + PORT + "."));