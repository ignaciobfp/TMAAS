var request = require('request');
var Twit = require('twit');

var replies = [
"Directamente de tus orejas a tu culo",
"Sufrimiento para tu cuerpo moreno",
"Sonando ahora en el quinto círculo del infierno",
"Como la gonorrea, pero en tus oídos",
"Música caliente en tu zona, sin esperas, sin tarjeta de crédito",
"Feliz Cumpleaños!... Navidad!... Lo que sea!",
"Esta canción es mala, pero peor es Coentrao",
"Cómo te gusta sufrir... viciosillo!",
"Menuda suerte, esta es de las frondosas",
"Si el karma te castiga así debes haber sido alguien horrible en otra vida",
"A las chicas de verdad les gusta la música frita",
"Esta canción hace llorar a las cebollas. Y a Chuck Norris. Pero poco",
"Sigue siendo mejor historia de amor que Crepúsculo",
"Cuenta la leyenda que Hitler escuchaba esta canción a menudo",
"¿Qué suena como un gato muriendo y tiene mejores gráficos que undertale? ESTO",
"Vetada por la ONU en 170 países. En el resto la música es ilegal",
"4 de cada 5 dentistas recomiendan lavarse los dientes después de escucharla",
"Te reto a que escuches esto de principio a fin",
"La garantía de tus cascos termina cuando le das al play",
"Piensa en tus oídos: Ellos no lo harían",
"Suerte que tienes dos orejas, tal vez necesites recambio",
"Suena como tus pedos, pero no huele a nada"
];


var privateData = require('./private');
// This section handles the client authentication
// private.js has the following structure
/*
module.exports.token={
    consumer_key:         '...'
  , consumer_secret:      '...'
  , access_token:         '...'
  , access_token_secret:  '...'
}
*/  
var T = new Twit(privateData.token);
 
//Hidden because it includes key for use
var url = privateData.url;

var tortureArray=[];

function getNameArrayFromString(s){
    //Prevents mentions to self that would cause recursive calls (no longer needed)
    //s=s.replace(/@torturamusical/gi,"");
    return s.match(/@\w+/g);
}

function getLongWordArrayFromString(s){
    var matchSucio = s.match(/@*\w{4,}/g);
    var matchLimpio=[];
    for (var a=0; a<matchSucio.length; a++){
        if (matchSucio[a].indexOf('@')==-1){
            matchLimpio.push(matchSucio[a]);
        }
    }
    return matchLimpio;
}

function getAllMentionsFromArray(s){
    var output="";
    if(s){
        for (var i=0; i<s.length; i++){
            output+=s[i]+" ";
        } 
    }
    return output;
}

function isRetweetOrResponse(tweet) {
  if ( tweet.retweeted_status
    || tweet.in_reply_to_status_id
    || tweet.in_reply_to_status_id_str
    || tweet.in_reply_to_user_id
    || tweet.in_reply_to_user_id_str
    || tweet.in_reply_to_screen_name )
    return true
}


function randomTortura(callback){
    //TO DO: Optimize this. Call ¿hourly? for list refreshes instead of on each call.
    //In the meanwhile, length=0 is the most efficient approach to this.
    tortureArray.length=0;
    requestTortura(url,"",function(resultado){
        callback(resultado[Math.floor(Math.random() * resultado.length)]);
    }
);
}

function searchForTortura(searchTerms, callback){
    //TO DO: Optimize this. Call ¿hourly? for list refreshes instead of on each call.
    //In the meanwhile, length=0 is the most efficient approach to this.
    tortureArray.length=0;
    requestTortura(url,"",function(resultado){
        var maxmatches=0;
        var indexofmaxmatches=-1;
        for (var i=0; i<resultado.length;i++){
            var currentmatches=0;
            for (var j=0; j<searchTerms.length; j++){
                if(resultado[i].title.toLowerCase().indexOf(searchTerms[j].toLowerCase())>-1){
                    currentmatches++;
                    if (currentmatches>maxmatches){
                        maxmatches=currentmatches;
                        indexofmaxmatches=i;
                    }
                }
            }
        }
        if(indexofmaxmatches>-1){
            callback(resultado[indexofmaxmatches],true);
        }else{
            callback(resultado[Math.floor(Math.random() * resultado.length)],false);
        }
    }
);
}

function VideoData(title, url) {
    this.title = title;
    this.url = url;
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
                
                tortureArray.push(new VideoData(title,videourl));
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

function CheckIfContains(value) {
    return this.stringToCheck.toLowerCase().indexOf(value)>=0;
}

function hasAnyOfStringArray(string, patterns){
    console.log("String: "+string);
    console.log("Patterns:"+patterns);
    //TO DO: Optimize this.
    if(patterns.some(CheckIfContains,{stringToCheck:string})){
        console.log("Resultado hasAnyOfStringArray: true");
        return true;
    }else{
        console.log("Resultado hasAnyOfStringArray: false");
        return false;
    }
}

function getDate() {

    var date = new Date();
/*
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
*/
    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return day + "/" + month + "/" + year;

}

function core(){
    randomTortura(function(resultado){
        T.post('statuses/update', { status: "Tortura de hoy "+getDate()+' '+resultado.title.substring(0,90)+' '+resultado.url }, function(err, data, response) {
            console.log("Tortura diaria posteada");
        });
    });
}

//Un post al arrancar, otro cada día:
core();
setInterval(core, 1000*3600*24);
    
var tracksGeneral=['@torturamusical', 'tortura musical', 'torturamusical', '#basuramusical', '#musicademierda', '#dametortura', '#culomusica', '#culomusica5000', '#musiculo'];
var tracksDedicatorias=['#torturapati', '#torturaparati', '#torturadedicada', '#torturaparatodos', '#torturapatodos'];
var flagsSearchByTitle=['titulo','título','busca','personaliza'];
var allTracks=tracksGeneral.concat(tracksDedicatorias);
var stream = T.stream('statuses/filter', { track: allTracks});


stream.start();
stream.on('tweet', function (tweet) {
    //If the tweet is a retweet or a response, do nothing
    if (isRetweetOrResponse(tweet)){
        console.log("Tweet ignorado por ser RT/Respuesta");
        return;
    }
        
    var reply = replies[Math.floor(Math.random() * replies.length)];
    //var stringMentions=getAllMentionsFromArray(getNameArrayFromString(tweet.text));
    var stringMentions="";
    var nameID = tweet.id_str;
    var name = tweet.user.screen_name;
    var longWords=getLongWordArrayFromString(tweet.text);
    //Prevent recursive callings with own mentions
    if(name.toLowerCase().indexOf("torturamusical")<0){
        console.log("Canción solicitada por @"+name);
        
        //Section for search calls
        if(hasAnyOfStringArray(tweet.text,flagsSearchByTitle)){
            searchForTortura(longWords,function(resultado,isExactMatch){
                console.log("Resultado de búsqueda: "+resultado.title+" exacto: "+isExactMatch);
                if(reply.length+stringMentions.length>110){//if tweet too long
                    T.post('statuses/update', {in_reply_to_status_id: nameID, status: reply +' '+resultado.url+' @' + name}, function(err, data, response) {});
                }else{
                    if(isExactMatch){
                        T.post('statuses/update', {in_reply_to_status_id: nameID, status: reply +' '+resultado.url+' ' + stringMentions +' @' + name}, function(err, data, response) {
                            console.log(err);
                            console.log(data);
                            console.log(response);
                        });
                    }else{
                        T.post('statuses/update', {in_reply_to_status_id: nameID, status: "No la encuentro, pero toma esta otra como disculpa" +' '+resultado.url+' ' + stringMentions +' @' + name}, function(err, data, response) {});
                    }
                }
                return;
            });
                 
        }
        //Section for random (non-search) calls
        randomTortura(function(resultado){
            console.log("Resultado de random: "+resultado.title);
            if (hasAnyOfStringArray(tweet.text,tracksGeneral)) {
                if(reply.length+stringMentions.length>110){//if tweet too long
                    T.post('statuses/update', {in_reply_to_status_id: nameID, status: reply +' '+resultado.url+' @' + name}, function(err, data, response) {});
                }else{
                    T.post('statuses/update', {in_reply_to_status_id: nameID, status: reply +' '+resultado.url+' ' + stringMentions + ' @' + name}, function(err, data, response) {});
                }
                return;
            }else
            if (hasAnyOfStringArray(tweet.text,tracksDedicatorias)) {
                if(reply.length+stringMentions.length>115){//if tweet too long
                    T.post('statuses/update', {status: resultado.url+' '+stringMentions}, function(err, data, response) {});
                }else{
                    T.post('statuses/update', {status: reply +' '+resultado.url+' '+stringMentions}, function(err, data, response) {});
                }
                return;
            }

        })
    }
});
/*
streamDedicatorias.start();
streamDedicatorias.on('tweet', function (tweet) {
    var reply = replies[Math.floor(Math.random() * replies.length)];
    var stringMentions=getAllMentionsFromArray(getNameArrayFromString(tweet.text));
    console.log("Canción solicitada por @"+tweet.user.screen_name+" para "+stringMentions);
    randomTortura(function(resultado){
        if(reply.length+stringMentions.length>115){//if tweet too long
            T.post('statuses/update', {status: resultado.url+' '+stringMentions}, function(err, data, response) {});
        }else{
            T.post('statuses/update', {status: reply +' '+resultado.url+' '+stringMentions}, function(err, data, response) {});
        }
    })
});
*/

