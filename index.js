var express = require("express");
var alexa = require("alexa-app");
var request = require("request");

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

alexaApp.launch(async function(req, response) {
  

    const user_id = req.data.session.userId;
    INDEXES[user_id] = 0;
    const options = { method: 'GET',
      url: 'https://streaming.shuffle.one/public/channel/promoted',
      qs: { channelId: '889', page: '1', count: '200' },
      headers: 
       { 'Postman-Token': 'e7d28854-b797-46fd-8a34-3485aacf028c',
         'Cache-Control': 'no-cache' } };
    MUSICS[user_id] = await request(options);
    const music = MUSICS[user_id][INDEXES[user_id]];
    console.log(music)
    const stream ={
      "url": music.aacPath,
      "token": music.id,
      "offsetInMilliseconds": 0
    };
    // response.say('Hi');
    response.audioPlayerPlayStream("REPLACE_ALL", stream);

});


alexaApp.audioPlayer("PlaybackStarted", function(request, response) {
  // immediate response
  const user_id = request.data.session.userId;
  const prevMusic = MUSICS[user_id][INDEXES[user_id]];
  INDEXES[user_id] ++;
  const music = MUSICS[user_id][INDEXES[user_id]];
  var stream = {
    "url": music.aacPath,
    "token": music.id,
    "expectedPreviousToken": prevMusic.id,
    "offsetInMilliseconds": 0
  };
  response.audioPlayerPlayStream("ENQUEUE", stream);
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