/**
 * Created by dl on 2017-08-01.
 */
module.exports = function (self) {
    return {
        getTickers: function*(market) {
            market = market + '_cny';
            var url = 'http://api.chbtc.com/data/v1/ticker?currency=' + market;
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

            return _.biz.outjson('0000', '', result);
        }
    }
}