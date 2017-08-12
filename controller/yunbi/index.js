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
    },
    getSosoBtcHomePage: function*() {
        var data = yield  this.sosobtcService.getSosoBtcHomePage();
        this.body = data;
    }
    , getChbtcPHomePage: function*() {
        var options = this.query;
        this.body = yield  this.render('yunbi/chbtctop', options);
    },
    getChbtcPHomeDetail: function*() {
        var options = this.query;
        //获取P网的BTC美元价格
        console.time('pBTC');
        var _pBTCUSD = yield this.sosobtcService.getPBTCUSDfromSoso();
        console.timeEnd('pBTC');
        var _pPriece = Number(0);
        var _PBtcPrice = Number(0);
        var _chbtcPriceData = {}
        console.time('pData');
        if (options.market == 'ltc') {
            _PBtcPrice = yield this.sosobtcService.getPLTC_BTCfromSoso();
        }
        else if (options.market == 'eth') {
            _PBtcPrice = yield this.sosobtcService.getPETH_BTCfromSoso();
        }
        else if (options.market == 'etc') {
            _PBtcPrice = yield this.sosobtcService.getPETC_BTCfromSoso();
        }
        else if (options.market == 'bts') {
            _PBtcPrice = yield this.sosobtcService.getPBTS_BTCfromSoso();
        }
        console.timeEnd('pData');

        console.time('chbtc');
        _chbtcPriceData = yield this.chBtcService.getTickers(options.market);
        console.timeEnd('chbtc');
        var _pData = {
            btcusdprice: _pBTCUSD,
            tobtcprice: _PBtcPrice,
            usdcny: options.usdcny,
            btccny: (Number(options.usdcny) * _pBTCUSD ).toFixed(6),
            currencyprice: (Number(options.usdcny) * _pBTCUSD * _PBtcPrice ).toFixed(6),
        }
        //console.log('xxxxx', _chbtcPriceData);
        if (_chbtcPriceData.code === '0000') {
            _chbtcPriceData = _chbtcPriceData.data[0];
        } else {
            _chbtcPriceData = {
                "dataType": "ticker",
                "ticker": {"vol": "0", "last": "0", "sell": "0", "buy": "0", "high": "0", "low": "0"},
                "date": "1501811950232",
                "channel": "bts_cny_ticker"
            };
        }

        var _result = {pData: _pData, chbtcData: _chbtcPriceData};
        yield  this.yunbiService.savePDataChbtcData(options.market, _pData, _chbtcPriceData);
        var _currentpoloniex = Number(_pData.currencyprice);
        var _currentChbtc = Number(_chbtcPriceData.ticker.sell);
        if (_currentChbtc == 0) {
            this.body = _result;
            return;
        }
        var _currentTime = M.moment().format('YYYY-MM-DD HH:mm:ss');
        var currentSub = (Number((_currentChbtc - _currentpoloniex  ) / _currentChbtc) * 100 ).toFixed(3);
        console.log('当前' +options.market + '差价:' + currentSub);
        if (currentSub >= 3) {
            var key = options.market + '_diff_' + _currentTime.substr(0, 16) ;
            if (G[key] == undefined) {
                G[key] = {
                    last: currentSub
                }
            }

            var bl =0.1 ;
            console.log((G[key])['last'],currentSub * (1-bl).toFixed(3) ,currentSub * (1+bl).toFixed(3) ) ;
            if ((G[key])['last'] < (currentSub * (1-bl).toFixed(3)) || (G[key])['last']  > (currentSub *(1+bl).toFixed(3)) ) {
                (G[key])['last'] = currentSub;

                var _data = yield this.messageService.sendBTCDiffMessage(_currentTime + '  P网到CHBTC', '差价到达' + currentSub + '%', '币种:' + options.market + ',CHBTC=' + _currentChbtc.toFixed(3) + ',polniex=' + _currentpoloniex.toFixed(3))
            }
        }
        this.body = _result;

    }

}