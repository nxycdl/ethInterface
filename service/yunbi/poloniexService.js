/**
 * Created by Administrator on 2017-09-17.
 */
module.exports = function (self) {
    return {
        getPloniexTickers: function*() {

            var url = 'http://45.77.70.81:3000/poloniex/returnTicker';
            var options = {};
            options.url = url;
            options.method = 'GET';
            var result = yield M.request(options);
            return result;
        }
    }
}