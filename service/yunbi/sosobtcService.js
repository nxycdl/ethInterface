/**
 * Created by dl on 2017-08-03.
 */
/**
 * Created by dl on 2017-08-01.
 */
module.exports = function (self) {
    return {
        pullData: function *(url) {
            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '0';
            }
            //console.log(result.body);
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            return $('div #price').text();
        },
        getSosoBtcHomePage33: function *() {
            /**
             * 爬取SOSOBTC主页;
             * @type {string}
             */
            var url = 'https://www.sosobtc.com/';
            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '';
            }
            console.log(result.body);
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            //var _table = $('div .tab-content .tab-content >div tbody tr').html();
            var _table = $('div .tab-content .tab-content >div tbody tr').each(function (i, elem) {
                console.log(i);
                if (i == 0) {
                    console.log("xxxxxxxxxxx");
                    console.log($(this).children().first().text());
                    console.log($(this).children().first().next().text());
                    //$(this).children()[1].text();
                    $(this).children().each(function (j, e) {
                        console.log($(e).text());
                    });
                    console.log("xxxxxxxxxx111x");
                }

            });

        },
        getSosoBtcHomePage2: function *() {
            /**
             * 爬取SOSOBTC主页;
             * @type {string}
             */
            var url = 'https://www.sosobtc.com/';
            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '';
            }
            console.log('请求结束')
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            //var _table = $('div .tab-content .tab-content >div tbody tr').html();
            var _poloniexInfo = $('div #default_market_tabs-tab-poloniex');
            var _a = _poloniexInfo.parent();

            _poloniexInfo.parent().addClass('active');
            console.log(_a);
            console.log("************************************");
            console.log(_a.children().children());


            /*var _table = $('div .tab-content .tab-content >div tbody tr').each(function(i, elem) {
             console.log(i);
             if (i ==0){
             console.log("xxxxxxxxxxx");
             console.log($(this).children().first().text());
             console.log($(this).children().first().next().text());
             //$(this).children()[1].text();
             $(this).children().each(function(j,e){
             console.log($(e).text());
             });
             console.log("xxxxxxxxxx111x");
             }

             });*/
            console.log('aaa', $('div #default_market_tabs-pane-poloniex').text());


        },
        getChbtcLtbFromSoso: function*() {
            url = "https://k.sosobtc.com/ltc_cnbtc.html";
            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '';
            }
            console.log(result.body);
        },
        getPLTC_BTCfromsoso: function*() {
            //获取bids的第一个有也可以;
            //https://k.sosobtc.com/data/depth?symbol=cnbtcltccny
            url = "https://k.sosobtc.com/data/depth?symbol=cnbtcbtscny";
            url = "https://k.sosobtc.com/btc_cnbtc.html";


            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '';
            }
            //console.log(result.body);
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            console.log($('div #price').text());
            return $('div #price').text();
        },
        getPBTCUSDfromSoso: function*() {
            return yield  this.pullData('https://k.sosobtc.com/btc_poloniex.html');

        },
        getPLTC_BTCfromSoso: function*() {
            var _data = yield  this.pullData('https://k.sosobtc.com/ltcbtc_poloniex.html');
            return _data;
        },
        getPETH_BTCfromSoso:function*(){
            return yield  this.pullData('https://k.sosobtc.com/ethbtc_poloniex.html');
        },
        getPETC_BTCfromSoso:function*(){
            return yield  this.pullData('https://k.sosobtc.com/etcbtc_poloniex.html');
        },
        getPBTS_BTCfromSoso:function*(){
            return yield  this.pullData('https://k.sosobtc.com/btsbtc_poloniex.html');
        }
    }
}