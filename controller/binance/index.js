/**
 * Created by Administrator on 2017-12-31.
 */
/**
 * Created by dl on 2017-05-25.
 */

module.exports = {
    _extend: {
        yunbiService: require(C.service + 'yunbi/yunbiService'),
        wxUtils: require(C.service + 'weixin/wxUtils'),
        tickService: require(C.service + 'yunbi/tickService'),
        sosobtcService: require(C.service + 'yunbi/sosobtcService'),
        chBtcService: require(C.service + 'yunbi/chBtcService'),
        messageService: require(C.service + 'yunbi/messageService'),
        bitfinexService: require(C.service + 'yunbi/bitfinexService'),
        poloniexService: require(C.service + 'yunbi/poloniexService'),
    },
    kline: function*() {
        var options = {
            market: this.query.market
        }
        console.log(options);
        const sql = 'select * from binaner where market = ? order by startTime ';
        let rowData = [];

        var db = M.pool.getConnection();
        try {
            var data = yield db.query(sql, [options.market]);
            data = data[0];
            for (i = 0; i < data.length; i++) {
                let row = [];
                row.push(data[i].startTime);
                row.push(data[i].open);
                row.push(data[i].close);
                row.push(0);
                row.push(0);
                row.push(data[i].low);
                row.push(data[i].high);
                row.push(0);
                row.push(0);
                row.push(data[i].volume);
                rowData.push(row);
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        options.rowData = JSON.stringify(rowData);
        console.log(rowData);
        this.body = yield this.render("binance/kline", options);
    },
}