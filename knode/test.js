var crypto = require('crypto');
var buycurrent = 0.06093000;
var sellcurrent = 0.06111;
//买成功之后卖的步长；
var buyToSellSetp = 0.0012;
//卖成功之后买的歩长;
var sellToBuySetp = 0.0012;
//第一次买和第二次买之前的步长;
var buySetp = 0.0012;
////第一次卖和第二次卖之前的步长;
var sellSetp = 0.0012;
var length = 3;
var buylist = [];
var selllist = [];
const ACCESS_KEY = 'xxxxxxxxxxxxxxx';
const SECRET_KEY = 'xxxxxxxxxxxxxxx';
const URL = 'https://yunbi.com/';

function printbuy() {
    var sout = '';
    for (var i = 0; i < buylist.length; i++) {
        var s = '';
        for (j = 0; j < buylist[i].length; j++) {
            var s1 = '';
            if (j % 2 == 0) {
                s1 = '买' + buylist[i][j];
            } else {
                s1 = '卖' + buylist[i][j];
            }
            s = s + s1;
        }
        sout = sout + s;
        console.log(s);
    }
    console.log('买列表' );
    console.log(buylist );


}


function printSeller() {
    var sout = '';
    for (var i = 0; i < selllist.length; i++) {
        var s = '';
        for (j = 0; j < selllist[i].length; j++) {
            var s1 = '';
            if (j % 2 == 0) {
                s1 = '卖' + selllist[i][j];
            } else {
                s1 = '买' + selllist[i][j];
            }
            s = s + s1;
        }
        sout = sout + s;
        console.log( s);
    }
    console.log('卖列表' );
    console.log(selllist);
}


function calcBuyList() {
    for (i = 0; i < length; i++) {
        var list = [];
        var calcnext = buycurrent;
        calcnext = calcnext - i * buySetp;
        var calc = calcnext;
        for (j = 0; j < 6; j++) {
            list[j] = calcnext;
            calcnext = calcnext + buyToSellSetp;
            if (j > 0 && j % 2 == 1) {
                calcnext = calc;
            }
        }
        buylist[i] = list;

    }
}


function calcSellList() {
    for (i = 0; i < length; i++) {
        var list = [];
        var calcnext = sellcurrent;
        calcnext = calcnext + (i * sellSetp );
        var calc = calcnext;
        for (j = 0; j < 6; j++) {
            list[j] = calcnext;
            calcnext = calcnext - sellToBuySetp;
            if (j > 0 && j % 2 == 1) {
                calcnext = calc;
            }
        }
        selllist[i] = list;
    }

}

function sign(args) {
    s = (crypto.createHmac('SHA256', SECRET_KEY).update(args).digest('hex'));
    return s;
}
if (sellcurrent < buycurrent) {
    console.log('数据异常');
} else {

    calcBuyList();
    calcSellList();
    printbuy();
    printSeller();
    // sign('GET|/api/v2/markets|access_key=xxx&foo=bar&tonce=123456789');
    //getMarkets();
    //getOrder();
    //createOrder('sell', 'sccny', 1, '0.04');
}

function crateOrder() {
    var tonce = parseInt(new Date().getTime() / 1000) + '';
}

function getTimeStamp() {
    return (new Date()).valueOf();
}

function getMarkets() {
    var tonce = getTimeStamp();
    var canonical_verb = 'GET';
    var canonical_uri = '/api/v2/markets';
    var canonical_query = 'access_key=' + ACCESS_KEY + '&foo=bar&tonce=' + tonce;
    var payload = canonical_verb + '|' + canonical_uri + '|' + canonical_query;
    var _sign = sign(payload);
    console.log(_sign);
    var url = URL + canonical_uri + '?' + canonical_query + '&signature=' + _sign;
    console.log(url);

}

function getOrder() {

    var tonce = getTimeStamp();
    var canonical_verb = 'GET';
    var canonical_uri = '/api/v2/orders';
    // var canonical_query = 'access_key=' + ACCESS_KEY + '&tonce=' + tonce;
    var canonical_query = 'access_key=' + ACCESS_KEY + '&market=sccny&tonce=' + tonce;
    var payload = canonical_verb + '|' + canonical_uri + '|' + canonical_query;
    console.log(payload);
    var _sign = sign(payload);
    console.log(_sign);
    var url = URL + canonical_uri + '?' + canonical_query + '&signature=' + _sign;
    console.log(url);
}

function createOrder(side, market, volume, price) {
    var tonce = getTimeStamp();
    var canonical_verb = 'POST';
    var canonical_uri = '/api/v2/orders';
    // var canonical_query = 'access_key=' + ACCESS_KEY + '&tonce=' + tonce;
    var canonical_query = 'access_key=' + ACCESS_KEY + '&market=' + market + '&price=' + price + '&side=' + side + '&tonce=' + tonce + '&volume=' + volume;
    var payload = canonical_verb + '|' + canonical_uri + '|' + canonical_query;
    console.log(payload);
    var _sign = sign(payload);
    console.log(_sign);
    var url = URL + canonical_uri + '?' + canonical_query + '&signature=' + _sign;
    console.log(url);
}

function createOrder2(side, market, volume, price) {
    var params = {
        market: market,
        price: price,
        side: side,
        volume: volume
    };
    var canonical_verb = 'POST';
    var canonical_uri = '/api/v2/orders';
    var _sign = _.signYun(canonical_verb, canonical_uri, params);
    console.log(_sign);
}

// console.log(buylist);