/**
 * Created with JetBrains PhpStorm.
 * User: lrossy
 * Date: 2013-11-24
 * Time: 3:57 PM
 * To change this template use File | Settings | File Templates.
 */

var _ = require('lodash');
var BTCE = require('btce');
var pair  = 'xpm_btc';
var elasticsearch = require('elasticsearch');
var util = require('util');
var cronJob = require('cron').CronJob;

/** CONFIG **/

var esconfig = {
    _index : 'coinscrape',
    server :
    {
        host : 'nzbhq.com',
        secure : false,
        port : 9200
    }
};

var apiuser ="test";
var apisecret = "test";

var exchange = "BTCe";
var numResults = 5000;
var pairs = new Array(
    "xpm_btc",
   /* "ftc_btc",
    "ppc_btc",
    "trc_btc",
    "eur_usd",
    "usd_rur",
    "nvc_usd",
    "nvc_btc",
    "nmc_usd",
    "nmc_btc",
    "ltc_eur",
    "ltc_rur",
    "ltc_usd",
    "ltc_btc",
    "btc_eur",
    "btc_rur",*/
    "btc_usd"
)
/** END CONFIG **/

exports.scrape = function (req, res) {

    es = elasticsearch(esconfig);

    var btce = new BTCE(apiuser, apisecret);
    var k = 0;
    var errCount = 0;
    var start = new Date().getTime();
    var tid = new Array();
    //console.log(pairs);
    //_([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');

    _(pairs).forEach(function(pair) {
        var args = {'pair':pair, 'count':numResults};
        btce.trades(args, _.bind(function(err,trades) {
            var N = trades.length;
            console.log(pair + " : " + N);
            var hrTime = process.hrtime();

            if (!trades)
                return this.retry(this.getTrades, args);

            if (trades.length === 0)
                return this.retry(this.getTrades, args);


            _.each(trades, function(array) {
                    //console.log(array);
                    //make rel object and map shit

                    array.pair = pair;
                    array.exchange = exchange;
                    var opts = {};
                    opts.id = 'btce_'+ array.tid;
                    opts._type = 'trade';
                    // console.log(JSON.stringify(array));

                    es.add(opts, JSON.stringify(array), function (err, results) {

                        k++;
                        if(err){
                            //console.log(err);
                            tid[opts.id]= array;
                            errCount++;
                        }
                        else{
                            //console.log("Added successfully: " + opts.id);
                            //var end = new Date().getTime();
                            //console.log(end);
                        }
                        util.print(util.format("  %s (%d%)\r", opts.id,k/N*100));
                        if(k == N){
                            var end = new Date().getTime();
                            var time = (end-start)/1000;
                            console.log("   SUMMARY   ");
                            console.log("Exchange: " + exchange);
                            console.log("Pair: " + pair);
                            z = N-errCount;
                            console.log("Successful: " + z);
                            if(errCount>0){
                                console.log("Failed: " + errCount);
                                console.log(tid);
                            }
                            console.log("Total: " + N);
                            console.log("Took : " + time + ' seconds');
                        }
                    });
                }
            );
        }, this));
    });
}

var statsCron = new cronJob('* * * 60 * * * * *', function () {
    exports.scrape();
}, null, true, "America/New_York");

