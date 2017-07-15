var fs = require('fs');
var request = require('request');
var async = require("async");
var youtubedl = require('youtube-dl');
//eval(fs.readFileSync('main.js')+'');
var privateData = require('./private');
 
var url = privateData.url;

var tortureArray=[];

fs.exists('Tortura Musical/00error.txt', function(exists) {
  if(exists) {
    console.log('Error list deleted');
    fs.unlinkSync('Tortura Musical/00error.txt');
  } else {
  }
});


function VideoData(index, title, url) {
    this.index = index
    this.title = title;
    this.url = url;
}


function downloadVideo(currentVideo, callback) {
    var video = youtubedl(currentVideo.url);
    // Optional arguments passed to youtube-dl.
    //['--format=mp4'],
    // Additional options can be given for calling `child_process.execFile()`.
    //{ cwd: __dirname });
    var exten="";
    video.on('info', function(info) {
        var fn=info._filename;
        console.log(fn);
        //Clean video title for invalid filename characters
        var cleanString = fn.replace(/[|&;$%@"<>()\\\/+,]/g, "");
        video.pipe(fs.createWriteStream('Tortura Musical/'+currentVideo.index+"_"+cleanString));
        //console.log('size: ' + info.size);
    });
    video.on('error', function error(err) {
        console.log('VIDEO FALLADO: '+currentVideo.title, err);
        fs.appendFile('Tortura Musical/00error.txt', currentVideo.index+'_'+currentVideo.title+'\n', function (err) {});
    });
    video.on('end', function() {
        callback();
    });
}

var queue = async.queue(downloadVideo, 10);

queue.drain = function() {
    console.log("All files downloaded");
};

function backupTortura(callback){
    //TO DO: Optimize this. Call ¿hourly? for list refreshes instead of on each call.
    //In the meanwhile, length=0 is the most efficient approach to this.
    tortureArray.length=0;
    requestTortura(url,"",function(resultado){callback(resultado);}
);
}

function requestTortura(url, extraParams, callback){
    request({
    url: url+extraParams,
    json: true
    }, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            if(body.items){
            for(var i=0; i<body.items.length; i++){
                var title=body.items[i].snippet.title;
                var videourl=generateURLFromID(body.items[i].snippet.resourceId.videoId);
                //console.log(title+','+videourl);
                //console.log('');
                
                tortureArray.push(new VideoData(tortureArray.length+1,title,videourl));
            }
            //console.log(body.nextPageToken);
            if(body.nextPageToken){
                requestTortura(url,"&pageToken="+body.nextPageToken, callback);
            }else{
                //console.log(tortureArray);
                callback && callback(tortureArray);
            }
            //console.log(body) // Print the json response
            }
        }
})   
}

function generateURLFromID(videoID){
    var baseurl='http://www.youtube.com/watch?v=';
    return baseurl+videoID;
}

//Main
backupTortura(function(resultado){
    var stream = fs.createWriteStream("Tortura Musical/00SongList.txt");
    stream.once('open', function(fd) {
        for (var i=0;i<resultado.length;i++){
            stream.write(resultado[i].index+'::'+resultado[i].title+'::'+resultado[i].url+'\n');
            queue.push(resultado[i]);
        }
        stream.end();
    });
});