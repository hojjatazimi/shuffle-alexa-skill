var express = require("express");
var alexa = require("alexa-app");
var request = require("request");

var PORT = process.env.PORT || 8080;
var app = express();

var MUSICS = [];
var INDEXES = [];
var SECONDS = [];
var REPEATS = [];
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
const      metadata = {
        "title": "My opinion: how could you diss-a-brie?",
        "subtitle": "Vince Fontana",
        "art": {
          "sources": [
            {
              "url": "https://url-of-the-skill-image.com/brie-album-art.png"
            }
          ]
        },
        "backgroundImage": {
          "sources": [
            {
              "url": "https://url-of-the-skill-image.com/brie-background.png"
            }
          ]
        }
      }
      console.log('Playing_from_launch', stream);
      response.audioPlayerPlayStream("REPLACE_ALL", stream, metadata);
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
alexaApp.playbackController('PreviousCommandIssued', (req, response) => {
  const user_id = req.data.context.System.user.userId;
  if (INDEXES[user_id] > 0){
    console.log('playing new');
    
    const old = INDEXES[user_id];
    INDEXES[user_id] --;
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
  }else{
    response.say('No Song Available!');
  }
});
alexaApp.playbackController('PauseCommandIssued', (req, response)=>{
  const user_id = req.userId;
  SECONDS[user_id] = req.context.AudioPlayer.offsetInMilliseconds;
  // console.log('DOOSTAN', req);
})
alexaApp.playbackController('PlayCommandIssued', (req, response)=>{
  const user_id = req.userId;
  var stream = {
    "url": MUSICS[user_id][INDEXES[user_id]].aacPath,
    "token": MUSICS[user_id][INDEXES[user_id]].id,
    "offsetInMilliseconds": SECONDS[user_id]
  };
  response.audioPlayerPlayStream("REPLACE_ALL", stream);
})
alexaApp.playbackController('PlaybackStopped', (req, response)=>{
  console.log('ammatono', req);
})
alexaApp.playbackController('PlaybackStarted', (req, response)=>{
  const user_id = req.userId;
  REPEATS[user_id] = false;
})



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
  if (REPEATS[user_id] == false){
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
  }


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




alexaApp.intent('AMAZON.NextIntent',  function(req, response){
  const user_id = req.data.context.System.user.userId;
  INDEXES[user_id]++;
  var stream = {
    "url": MUSICS[user_id][INDEXES[user_id]].aacPath,
    "token": MUSICS[user_id][INDEXES[user_id]].id,
    "offsetInMilliseconds": 0
  };
  response.audioPlayerPlayStream("REPLACE_ALL", stream);
})
alexaApp.intent('AMAZON.PauseIntent',  function(req, response){
  const user_id = req.data.context.System.user.userId;
  SECONDS[user_id] = req.context.AudioPlayer.offsetInMilliseconds;
  response.audioPlayerStop()
})
alexaApp.intent('AMAZON.ResumeIntent', function(req, response){
  const user_id = req.data.context.System.user.userId;
  var stream = {
    "url": MUSICS[user_id][INDEXES[user_id]].aacPath,
    "token": MUSICS[user_id][INDEXES[user_id]].id,
    "offsetInMilliseconds": SECONDS[user_id]
  };
  response.audioPlayerPlayStream("REPLACE_ALL", stream);
})
alexaApp.intent('AMAZON.RepeatIntent', function(req, response){
  const user_id = req.data.context.System.user.userId;
  REPEATS[user_id] = true;
  var stream = {
    "url": MUSICS[user_id][INDEXES[user_id]].aacPath,
    "token": MUSICS[user_id][INDEXES[user_id]].id,
    'expectedPreviousToken': MUSICS[user_id][INDEXES[user_id]].id,
    "offsetInMilliseconds": SECONDS[user_id]
  };
  response.say('Song will be repeated.');
  response.audioPlayerPlayStream("ENQUEUE", stream);
})

alexaApp.intent('AMAZON.PreviousIntent', function(req, response){
  const user_id = req.data.context.System.user.userId;
  if (INDEXES[user_id] > 0){
    console.log('playing new');
    
    const old = INDEXES[user_id];
    INDEXES[user_id] --;
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
  }else{
    response.say('No Song Available!');
  }
})

app.listen(PORT, () => console.log("Listening on port " + PORT + "."));