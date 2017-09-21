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
        var _currentTime = M.moment().format('MM-DD HH:mm:ss');

        var _chbtcPriceData = {}
        console.time('chbtc');
        _chbtcPriceData = yield this.chBtcService.getChbtcTickers(options.market);
        console.log('CHBTCDATA',_chbtcPriceData);
        if (G['CHBTCPRICE'] == undefined) {
            G['CHBTCPRICE'] = {};
        }
        var _chbtcBTCPrice = G['CHBTCPRICE'][_currentTime];
        if (_chbtcBTCPrice == undefined) {
            _chbtcBTCPrice = yield this.chBtcService.getChbtcTickers('btc');
            G['CHBTCPRICE'][_currentTime] = _chbtcBTCPrice;
        } else {
            console.log('缓存获取_chbtcBTCPrice');
            var size = 0;
            for (key in G['CHBTCPRICE']) {
                size++;
            }
            if (size > 100) {
                G['CHBTCPRICE'] == undefined;
            }
        }


        console.timeEnd('chbtc');

        var poloniexData = yield this.poloniexService.getPloniexTickers();
        poloniexData = JSON.parse(poloniexData.body);
        poloniexData = JSON.parse(poloniexData.body);
        var _marketData = poloniexData['BTC_' + options.market.toUpperCase()];
        var _ustdBTC = poloniexData['USDT_BTC'];
        console.log("**************************************");
        //console.log(_marketData);
        console.log(_ustdBTC);
        console.log("**************************************");

        _pData = {
            btcusdbuyprice: _ustdBTC.highestBid,
            btcusdsellprice: _ustdBTC.lowestAsk,
            seller: _marketData.lowestAsk,
            buy: _marketData.highestBid
        }
        console.log('seller'+_marketData.lowestAsk);
        console.log('buy'+_ustdBTC.highestBid);
        console.log(_pData);

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

        if (_chbtcBTCPrice.code === '0000') {
            _chbtcBTCPrice = _chbtcBTCPrice.data[0];
        } else {
            _chbtcBTCPrice = {
                "dataType": "ticker",
                "ticker": {"vol": "0", "last": "0", "sell": "0", "buy": "0", "high": "0", "low": "0"},
                "date": "1501811950232",
                "channel": "bts_cny_ticker"
            };
        }

        var _result = {pData: _pData, chbtcData: _chbtcPriceData, chbtcBTCPrice: _chbtcBTCPrice};

        //yield  this.yunbiService.savePDataChbtcData(options.market, _pData, _chbtcPriceData);
        var _currentpoloniex = Number(_pData.currencyprice);
        var _currentChbtc = Number(_chbtcPriceData.ticker.sell);
        if (_currentChbtc == 0) {
            this.body = _result;
            return;
        }
        var _currentTime = M.moment().format('YYYY-MM-DD HH:mm:ss');
        var currentSub = (Number((_currentChbtc - _currentpoloniex  ) / _currentChbtc) * 100 ).toFixed(3);
        console.log('当前' + options.market + '差价:' + currentSub);
        /*if (Math.abs(currentSub) >= 3.5 && options.send == '1') {
            var key = options.market + '_diff_' + _currentTime.substr(0, 16);
            var _dateM = M.moment().format('YYYY-MM-DD HH:mm');
            if (G[key] == undefined) {
                G[key] = {
                    _dateM: 0
                }
            }
            //一分钟发的超过10次不在发送;
            var newDate = new Date();

            if (G[key][_dateM] == undefined) {
                G[key][_dateM] = 0;
            }
            if (G[key][_dateM] > 4) {
                return;
            }
            G[key][_dateM] = (G[key][_dateM]) + 1;
            var _data = yield this.messageService.sendBTCDiffMessage(_currentTime + '  P网到CHBTC', '差价到达' + currentSub + '%', '币种:' + options.market + ',CHBTC=' + _currentChbtc.toFixed(3) + ',polniex=' + _currentpoloniex.toFixed(3))

        }*/
        this.body = _result;

    },
    sendMessage: function*() {
        var inData = this.request.body;
        if (inData.messagetype == '1') {
            //涨幅连续超过三次短信;
            var _currentTime = M.moment().format('YYYY-MM-DD HH:mm:ss');
            yield this.messageService.sendBTCDiffMessage(_currentTime, inData.messageinfo, '开盘涨幅3分钟内连续上涨！')
        }
        this.body = {result: true};

    },
    getBfpPage: function*() {
        var options = this.query;
        this.body = yield this.render('yunbi/bfp', options);
    },
    getBfpData: function*() {
        var options = this.query;
        var market = options.market;
        var key1 = 't' + market.toUpperCase() + 'BTC';
        var key = 'BTC_' + market.toUpperCase();
        //var bitfinexData = yield this.bitfinexService.getTickers(key1);
        //console.log('1235', poloniexData.body);
        console.log('开始调用P网接口');
        var poloniexData = yield this.poloniexService.getPloniexTickers();
        poloniexData = JSON.parse(poloniexData.body);
        console.log(poloniexData);
        poloniexData = JSON.parse(poloniexData.body);

        poloniexData = poloniexData[key];


        var data = {
            //bitfinexData: bitfinexData,
            poloniexData: poloniexData
        }
        console.log('end');
        this.body = data;
    }


}