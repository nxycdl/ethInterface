/**
 * Created by dl on 2017-08-03.
 */
/**
 * Created by dl on 2017-08-01.
 */
module.exports = function(self){
    return {
        getSosoBtcHomePage2:function *() {
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
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            //var _table = $('div .tab-content .tab-content >div tbody tr').html();
            var _table = $('div .tab-content .tab-content >div tbody tr').each(function(i, elem) {
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

            });

        },
        getSosoBtcHomePage:function *() {
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
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            //var _table = $('div .tab-content .tab-content >div tbody tr').html();
            var _table = $('div .tab-content .tab-content >div tbody tr').each(function(i, elem) {
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

            });

        }
    }
}