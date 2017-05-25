/**
 * Created by dl on 2017-05-25.
 */
module.exports = {
    _extend: {
        yunbiService: require(C.service + 'yunbi/yunbiService'),
        wxUtils: require(C.service + 'weixin/wxUtils')
    },
    index: function*() {
        this.body = yield this.render("yunbi/index");
    },
    get: function *() {
        var inData = this.query;
        this.body = {error: '1', message: 'get methods', data: inData};
    },
    batchCreateOrder: function*() {
        var amount = 1000;
        var db = M.pool.getConnection();
        try {
            var sql = "select * from prelist";
            var data = yield db.query(sql);

            for (var i = 0; i < data[0].length; i++) {
                var info = data[0][i];
                console.log(info);
                var order = yield this.yunbiService.createOrder(info.flg === '0' ? 'sell' : 'buy', 'sccny', amount, info.price1);
                order = JSON.parse(order);
                var sql = 'insert into orderlist(preid,busid, flg, price, amount, tradeType, currency)values(?,?,?,?,?,?,?)'
                var ins = yield db.query(sql, [info.id, order.id, info.flg, order.price, order.volume, order.side, 0]);
                if (ins[0].affectedRows != 0) {
                    console.log(ins)
                }
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        this.body = {ret: true, message: ''};
    }
}