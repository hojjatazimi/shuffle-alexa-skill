var express = require("express");
var alexa = require("alexa-app");

var PORT = process.env.PORT || 8080;
var app = express();

var musics = [];

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
  console.log('hojjat_shuffle');
  console.log(request);
  response.say("Hello from Hojjat");
});

alexaApp.intent('playChannel', function(req, res){
  const stream ={
    "url": "https://box.backtory.com/beeptunes/980/03151/738/AAC_HE/1_4ud6UHEQtS.m4a",
  };
  res.audioPlayerPlayStream("ENQUEUE", stream);
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