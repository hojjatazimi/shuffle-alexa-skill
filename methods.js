exports.getMusics =  () =>{
    var request = require("request");

    var options = { method: 'GET',
      url: 'https://streaming.shuffle.one/public/channel/promoted',
      qs: { channelId: '889', page: '1', count: '200' },
      headers: 
       { 'Postman-Token': 'e7d28854-b797-46fd-8a34-3485aacf028c',
         'Cache-Control': 'no-cache' } };
    return new Promise(function(resolve, reject){
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200){
                out = JSON.parse(body);
                resolve(out);
            }else{
                reject(error);   
            }
          });
    });

}

  