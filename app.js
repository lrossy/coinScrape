var express = require('express'),
    app = express(),
    btceScraper = require('./module/btceScraper.js');

var cstats = 0;
var rstats = 0;
// Main Api Call
//app.get('/s/:q', search.do_Search);

btceScraper.scrape("1", function (err, dat) {
    if(!err){
        // res.send(dat);
    }else{

        // res.send("end");
    }
});

app.get('/scrape', btceScraper.scrape);

app.listen(815, function () {
   // process.setgid('www-data');
   // process.setuid('www-data');
});
