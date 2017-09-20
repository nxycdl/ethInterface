/**
 * Created by Administrator on 2017-09-17.
 */
module.exports = function (self) {
    return {
        getTickers: function*(marketList) {
            console.log('xxxx');
            var url = 'https://api.bitfinex.com/v2/tickers';
            url = url + '?symbols=' + marketList;
            console.log(url);
            var result = yield M.request({
                uri: url,
                method: 'GET'
            });
            return result;
        }
    }
}