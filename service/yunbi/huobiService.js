/**
 * Created by dl on 2017-08-01.
 */
module.exports = function (self) {
    return {
        getTickers: function*(market) {
            market = 'detail_' + market + '_json.js';
            var url = 'http://api.huobi.com/staticmarket/' + market;
            var result = {
                body: '[]'
            }
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
                return _.biz.outjson('-1', e, []);
            }
            if (result.body.length == 0) {
                return _.biz.outjson('0000', '', []);
            }
            result = JSON.parse(result.body);

            var outdata = {ticker: {}};
            outdata.date = parseInt(new Date().getTime() / 1000) + '';
            outdata.ticker.buy = result.buys[0].price;
            outdata.ticker.sell = result.sells[0].price;
            outdata.ticker.low = result.p_low;
            outdata.ticker.high = result.p_high;
            outdata.ticker.last = result.p_last;
            outdata.ticker.vol = result.amount;
            return _.biz.outjson('0000', '', outdata);
        }
    }
}