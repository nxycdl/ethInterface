/**
 * Created by dl on 2017-05-25.
 */
module.exports = function (self) {
    return {
        createOrder: function*(side, market, volume, price) {
            var params = {
                market: market,
                price: price,
                side: side,
                volume: volume
            };
            console.log(params);
            var canonical_verb = 'POST';
            var canonical_uri = '/api/v2/orders';
            params = _.signYunbi(canonical_verb, canonical_uri, params);
            console.log('create YunBi Order\t\t' + new Date());
            var result = yield M.request({
                uri: 'https://yunbi.com' + canonical_uri,
                method: 'POST',
                form: params
            });
            console.log('create YunBi Order end\t\t' + new Date() + '\n' + result.body);
            return result.body;
        },
        getOrderList: function*(market) {
            var params = {
                market: market
            }
            var canonical_verb = 'GET';
            var canonical_uri = '/api/v2/orders';
            params = _.signYunbi(canonical_verb, canonical_uri, params);
            // console.log(params);
            var data = '';
            for (var key in params) {
                data = data + '&' + key + '=' + params[key];
            }
            data = data.substr(1);
            // console.log(data);
            console.log('query order list \t\t' + new Date());
            var result = yield M.request({
                uri: 'https://yunbi.com' + canonical_uri + '?' + data,
                method: 'GET'
            });
            console.log('query order list end\t\t' + new Date());
            return result.body;
        },
        createJobList: function*() {

        }

    }
}