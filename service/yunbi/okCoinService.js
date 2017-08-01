/**
 * Created by dl on 2017-07-31.
 */
module.exports = function (self) {
    return {
        getTickers:function*(market){
            market = market +'_cny';
            var url = 'https://www.okcoin.cn/api/v1/ticker.do?symbol='+market;
            // var url = 'https://yunbi.com//api/v2/tickers/' + market + '.json';
            var result = {
                body: '[]'
            }
            console.log('start get tickers \t\t' + new Date());
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.log(e);
                result = {
                    body: '[]'
                }
                return _.biz.outjson('-1',e,[]);
            }
            console.log('end get tickers \t\t' + new Date());
            if (result.body.length == 0) {
                return _.biz.outjson('0000','',[]);
            }
            result = JSON.parse(result.body);

            return _.biz.outjson('0000','',result);
        }
    }
}