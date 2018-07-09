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
    try{
      MUSICS[user_id]  =  await methods.getMusics();
      const music = MUSICS[user_id][INDEXES[user_id]];
      const stream ={
        "url": music.aacPath,
        "token": music.id,
        "offsetInMilliseconds": 0
      };
      console.log('Playing_from_launch', stream);
      response.audioPlayerPlayStream("REPLACE_ALL", stream);
    }catch(e){
      console.error(e);
      response.say('Something went wrong');
    }
});

alexaApp.playbackController('NextCommandIssued', (req, response) => {
  const user_id = req.data.context.System.user.userId;
  INDEXES[user_id]++;
  var stream = {
    "url": MUSICS[user_id][INDEXES[user_id]].aacPath,
    "token": MUSICS[user_id][INDEXES[user_id]].id,
    "offsetInMilliseconds": 0
  };
  response.audioPlayerPlayStream("REPLACE_ALL", stream);
});
alexaApp.playbackController('PlaybackStopped', (req, response)=>{
  console.log('ammatono', req);
})

// alexaApp.audioPlayer("PlaybackFinished", function(request, response) {
//   // immediate response
//   const user_id = request.data.context.System.user.userId;
//   const music = MUSICS[user_id][INDEXES[user_id]];
//   var stream = {
//     "url": music.aacPath,
//     "token": music.id,
//     "offsetInMilliseconds": 0
//   };
//   console.log('finished, playing new', stream);
//   response.audioPlayerPlayStream("REPLACE_ALL", stream);
// });

alexaApp.pre = function(request, response, type) {
  // console.log('req', request);
  console.log('*')
  console.log('*')
  console.log('*')
  console.log('type', type);
  console.log('*')
  console.log('*')
  console.log('*')
};

alexaApp.audioPlayer("PlaybackNearlyFinished", function(request, response) {
  console.log('playing new');
  const user_id = request.data.context.System.user.userId;
  const old = INDEXES[user_id];
  INDEXES[user_id] ++;
  console.log('index changed from '+String(old), String(INDEXES[user_id]));
  
  
  const music = MUSICS[user_id][INDEXES[user_id]];
  var stream = {
    "url": music.aacPath,
    "token": music.id,
    // 'expectedPreviousToken':MUSICS[user_id][old].id,
    "offsetInMilliseconds": 0
  };
  console.log('finished, playing new', stream);
  response.audioPlayerPlayStream("REPLACE_ALL", stream);


});

alexaApp.on('System.ExceptionEncountered', function(req, res){
  console.log('err', req.data.request.error);
  console.log('cause', req.data.request.cause);
})

alexaApp.intent('playChannel', async function(req, response){
  const user_id = req.data.session.userId;
  INDEXES[user_id] = 0;
  try{
    MUSICS[user_id]  =  await methods.getMusics();
    const music = MUSICS[user_id][INDEXES[user_id]];
    const stream ={
      "url": music.aacPath,
      "token": music.id,
      "offsetInMilliseconds": 0
    };
    response.audioPlayerPlayStream("REPLACE_ALL", stream);
  }catch(e){
    console.error(e);
    response.say('Something went wrong');
  }
})

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));