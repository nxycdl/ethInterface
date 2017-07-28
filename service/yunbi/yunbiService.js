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
        getOrderList: function*(market, state) {
            var params = {
                market: market,
                state: state || 'wait',
                order_by: 'desc'
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

        },
        getQueueList: function*(db, flg, status) {
            var sql = "SELECT * FROM queue  where flg=? and status = ?";
            var data = yield db.query(sql, [flg, status]);
            return data[0];
        },
        getAllWaitQueueList: function*(db) {
            //获取所有正在进行中的订单;
            var sql = "SELECT * FROM queuedetail  where status =? order by id ";
            var data = yield db.query(sql, ['1']);
            return data[0];
        },
        getQueueDetail: function*(db, qid) {
            var sql = "SELECT * FROM queuedetail  where qid = ? order by xid ";
            var data = yield db.query(sql, [qid]);
            return data[0];
        },
        updateQueryDetail: function*(db, id, bussid, created_at, status) {
            var sql = 'update queuedetail set bussid=? , created_at = ? ,status = ?  where id = ? ';
            var data = yield db.query(sql, [bussid, created_at, status, id]);
            return data[0];
        },
        getOrderInfoFromServerById: function*(id) {
            var params = {id: id};
            var canonical_verb = 'GET';
            var canonical_uri = '/api/v2/order';
            params = _.signYunbi(canonical_verb, canonical_uri, params);
            console.log(params);
            var data = '';
            for (var key in params) {
                data = data + '&' + key + '=' + params[key];
            }
            var result = yield M.request({
                uri: 'https://yunbi.com' + canonical_uri + "?" + data,
                method: 'GET'
            });
            // console.log(result.body);
            return result.body;
        },
        updateQueryDetailStatus: function *(db, id, status) {
            var sql = 'update queuedetail set status = ?  where id = ? ';
            var data = yield db.query(sql, [status, id]);
            return data[0];

        }
    }
}