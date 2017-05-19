/**
 * Created by dl on 2016/4/2.
 */
/**
 *
 * @type {{_extend: {}, gotoMain: "主页"}}
 */
module.exports = {
    _extend: {
        htglService: require(C.service + 'htgl/htglService'),
        wxUtils: require(C.service + 'weixin/wxUtils')
    },
    get: function *() {
        var inData = this.query;
        this.body = {error: '1', message: 'get methods', data: inData};
    },
    post: function*() {
        var inData = this.request.body;
        this.body = {error: '1', message: 'post methods', data: inData};
    },
    home: function*() {
        this.body = yield this.render("home");
    },
    dbtest: function*() {
        var url = 'http://api.chbtc.com/data/v1/ticker?currency=eth_cny';
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
        }
        if (result.body.length == 0) {
            return;
        }
        result = JSON.parse(result.body);

        var date = new Date(parseInt(result.date));
        var db = M.pool.getConnection();
        try {
            var sql = "insert into busslog (rq, buy, high, low, sell, last, vol)values(?,?,?,?,?,?,?)";
            var data = yield db.query(sql, [date, result.ticker.buy, result.ticker.high, result.ticker.low, result.ticker.sell, result.ticker.last, result.ticker.vol]);
            this.body = data[0];
        } finally {
            M.pool.releaseConnection(db);
        }
    }
}