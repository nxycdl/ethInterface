/**
 * Created by dl on 2017-05-25.
 */

module.exports = {
    _extend: {
        yunbiService: require(C.service + 'yunbi/yunbiService'),
        wxUtils: require(C.service + 'weixin/wxUtils'),
        tickService: require(C.service + 'yunbi/tickService')
    },
    index: function*() {
        this.body = yield this.render("yunbi/index");
    },
    get: function *() {
        var inData = this.query;
        this.body = {error: '1', message: 'get methods', data: inData};
    },
    batchCreateOrder: function*() {
        var amount = 10;
        var db = M.pool.getConnection();
        try {
            var sql = "select * from prelist ";
            var data = yield db.query(sql);

            for (var i = 0; i < data[0].length; i++) {
                var info = data[0][i];

                var side = (info.flg === 0 ? 'sell' : 'buy');
                console.log(side, info);
                var order = yield this.yunbiService.createOrder(side, 'sccny', amount, info.price1);
                order = JSON.parse(order);
                console.log(order);
                var sql = 'insert into orderlist(preid,busid, flg, price, amount, tradeType, currency)values(?,?,?,?,?,?,?)'
                var ins = yield db.query(sql, [info.id, order.id, info.flg, order.price, order.volume, order.side, 0]);
                if (ins[0].affectedRows != 0) {
                    console.log(ins.error)
                }
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        this.body = {ret: true, message: ''};
    },
    sccnydept: function*() {
        this.body = yield this.render("yunbi/sccnydept");
    },
    sccnydeptQuery: function*() {
        //var url = "https://plugin.sosobtc.com/widgetembed/data/depth?symbol=yunbisccny";
        var url = "https://yunbi.com//api/v2/depth.json?market=sccny";
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
        }
        var data = JSON.parse(result.body);
        data.currentTime = M.moment.unix(data.timestamp).format('MM-DD HH:mm:ss');
        this.body = data;
    },
    schome: function*() {
        this.body = yield this.render("yunbi/schome");
    },
    marketticker: function*() {
        var options = {
            market: this.query.market
        }
        this.body = yield this.render("yunbi/marketticker", options)
    },
    currencydiff: function*() {
        var option = {
            market: this.query.market
        }

        this.body = yield this.render("yunbi/currencydiff")
    },
    getTickers: function*() {
        console.log(this.query);
        this.body = yield this.tickService.getAllTickers(this.query.exchange, this.query.market);
    },
    getLTBTickersDiff: function*() {
        var options = {market: 'ltc'};
        this.body = yield  this.render("yunbi/currencydiff", options);
    },
    getLTBTickers: function*() {
        console.log(this.query);
        var chbtc_ltb = yield this.tickService.getAllTickers('CHBTC', 'ltc');
        var okCoin_ltb = yield  this.tickService.getAllTickers('OKCOIN', 'ltc');
        this.body = {'OKCOIN': okCoin_ltb, 'CHBTC': chbtc_ltb};
    }

}