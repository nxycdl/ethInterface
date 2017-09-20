/**
 * Created by Administrator on 2017-09-17.
 */
module.exports = function (self) {
    return {
        getPloniexTickers: function*() {

            var url = 'http://47.74.32.135/poloniex/returnTicker';
            var options = {};
            options.url = url;
            options.method = 'GET';
            var result = yield M.request(options);
            return result;
        }
    }
}