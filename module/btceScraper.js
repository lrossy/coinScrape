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
var cronJob = require('cron').CronJob;

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

exports.scrape = function (req, res) {

    es = elasticsearch(esconfig);

    var btce = new BTCE(apiuser, apisecret);

    var args = {'pair':pair, 'count':10};

    btce.trades(args, _.bind(function(err,trades) {
        if (!trades)
            return this.retry(this.getTrades, args);

        if (trades.length === 0)
            return this.retry(this.getTrades, args);

        _.each(trades, function(array) {
                //console.log(array);
                //make rel object and map shit

                array.pair = 'xpm_btc';
                array.exchange = 'BTCe';
                var opts = {};
                opts.id = 'btce_'+ array.tid;
                opts._type = 'trade';
                // console.log(JSON.stringify(array));

                es.add(opts, JSON.stringify(array), function (err, results) {
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("Added successfully" + opts.id);
                    }
                });

            }
        );

    }, this));
}

var statsCron = new cronJob('* * * 60 * * * * *', function () {
    exports.scrape();
}, null, true, "America/New_York");

