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
            market: (this.query.market).toUpperCase(),
            interval: this.query.interval || '1m'
        }
        options.interval = (options.interval).toLowerCase();

        const sql = 'select * from binaner where market = ? and intval = ? order by startTime ';
        let rowData = [];
        let volumes = [];

        var db = M.pool.getConnection();
        try {
            var data = yield db.query(sql, [(options.market), options.interval]);
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
                volumes.push(data[i].volume);
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        options.rowData = JSON.stringify(rowData);
        options.volumes = JSON.stringify(volumes);
        this.body = yield this.render("binance/kline", options);
    },
}