/**
 * Created by dl on 2017-08-01.
 */

var yunbiService = require(C.service + 'yunbi/yunbiService')();
var okCoinService = require(C.service + 'yunbi/okCoinService')();
var chBtcService = require(C.service + 'yunbi/chBtcService')();
var huobiService = require(C.service + 'yunbi/huobiService')();

module.exports = function (self) {
    return {
        getAllTickers: function*(exchange, market) {
            var exchangeIndex = _.indexOf(C.myConfig.exchangeList, exchange);
            var marketIndex = _.indexOf(C.myConfig.marketList, market);
            var outdata = {};
            //查询不到抛出异常;
            console.error(exchangeIndex, marketIndex, C.myConfig.exchangeList, exchange);
            if (exchangeIndex == -1 || marketIndex == -1)
                return _.biz.outjson('-1', '非法的入参', [])
            if (exchange === 'YUNBI') {
                outdata = yield yunbiService.getTickers(market);
            } else if (exchange == 'OKCOIN') {
                outdata = yield okCoinService.getTickers(market);
            } else if (exchange == 'CHBTC') {
                outdata = yield chBtcService.getTickers(market);
            } else if (exchange == 'HUOBI') {
                outdata = yield huobiService.getTickers(market);
            }
            return outdata;
        }
    }
}