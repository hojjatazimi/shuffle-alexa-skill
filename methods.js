exports.getMusics = (cb) =>{
    cb = cb || function(){};
    var request = require("request");

    var options = { method: 'GET',
      url: 'https://streaming.shuffle.one/public/channel/promoted',
      qs: { channelId: '889', page: '1', count: '200' },
      headers: 
       { 'Postman-Token': 'e7d28854-b797-46fd-8a34-3485aacf028c',
         'Cache-Control': 'no-cache' } };
    
      request(options, function (error, response, body) {
        if (error) throw new Error(error);
        // console.log('response', response)
        // console.log(body);
        out = JSON.parse(body);
        return cb(out);
      });
}