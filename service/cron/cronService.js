/**
 * Created by dl on 2017-01-04.
 */
var wxUtils = require(C.service + 'weixin/wxUtils')();
var yunbiService = require(C.service + 'yunbi/yunbiService')();
var okCoinService = require(C.service + 'yunbi/okCoinService')();
var chBtcService = require(C.service + 'yunbi/chBtcService')();
var huobiService = require(C.service + 'yunbi/huobiService')();
var tickService = require(C.service + 'yunbi/tickService')();
var netpullService = require(C.service + 'netpull/netpullService')();
var messageService = require(C.service + 'yunbi/messageService')();
var yunbiOrderHead = require(C.service + 'yunbi/yunbiOrderHead')();
const binance = require('node-binance-api');

module.exports = {

    job1: function *() {
        var outdata = [];
        var url = C.serviceUrl + '/htgl/app/winxingetpushmsginfo.do?';

        try {
            var result = yield M.request({
                uri: url,
                method: 'get'
            });
        } catch (e) {
            console.log(e);
            return;
        }
        var ret = JSON.parse(result.body);
        if (ret.err == '0') {
            var msg1 = ret.msg1;
            var msg2 = ret.msg2;
            var data = ret.data;
            if (data.length == 0) return;

            var token = M.co(wxUtils.getAccess_token());


            token.then(function (result) {
                var access_token = result;

                data.forEach(function (item) {
                    var params = {
                        "touser": item[3],
                        "template_id": "peE3rZeHQN0asSTpawAHcP_KbuXocYeeH8sHJmanV1Y",
                        //"url":"http://weixin.qq.com/download",
                        "data": {
                            "first": {
                                "value": msg1,
                                "color": "#173177"
                            },
                            "keyword1": {
                                "value": item[1],
                                "color": "#173177"
                            },
                            "keyword2": {
                                "value": item[0],
                                "color": "#173177"
                            },
                            "keyword3": {
                                "value": item[2],
                                "color": "#173177"
                            },
                            "remark": {
                                "value": msg2,
                                "color": "#173177"
                            }
                        }
                    }

                    var sendPromise = M.co(wxUtils.sendTempleMessage(access_token, params));
                    sendPromise.then(function (result) {
                        console.log(result);
                    });
                });
            });
        }
    },
    job2: function *() {
        console.log(new Date(), 'This is Job2 start');
    },
    getTickers: function*(market) {
        var url = 'https://yunbi.com//api/v2/tickers/' + market + '.json';
        var result = {
            body: '[]'
        }
        console.log('start get tickers \t\t' + new Date());
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
        console.log('end get tickers \t\t' + new Date());
        if (result.body.length == 0) {
            return;
        }
        result = JSON.parse(result.body);

        var date = new Date(parseInt(result.at * 1000));

        var db = M.pool.getConnection();
        try {
            var sql = "insert into busslog (market,rq, buy, high, low, sell, last, vol)values(?,?,?,?,?,?,?,?)";
            var data = yield db.query(sql, [market, date, result.ticker.buy, result.ticker.high, result.ticker.low, result.ticker.sell, result.ticker.last, result.ticker.vol]);
            this.body = data[0];
        } finally {
            M.pool.releaseConnection(db);
        }
    },
    setOrder: function*() {
        var data = {
            price: 1,
            amount: 1,
            tradeType: 1,
            currency: ltc_cny
        }

        var url = "https://trade.chbtc.com/api/order?method=order&accesskey=accesskey&price=1024&amount=1.5&tradeType=1&currency=btc_cny&sign=请求加密签名串&reqTime=当前时间毫秒数";

    },
    createOrder: function*(side, market, volume, price) {
        var data = yield yunbiService.createOrder(side, market, volume, price);
        console.log(data);
    },
    getOrderList: function*(market) {
        var orderList = yield yunbiService.getOrderList(market, 'wait');
        console.log(orderList);
    },
    createJobList: function*() {
        var buylist = [];
        var selllist = [];
        buylist = [[0.06093, 0.06213, 0.06093, 0.06213, 0.06093, 0.06213],
            [0.05973, 0.06093, 0.05973, 0.06093, 0.05973, 0.06093],
            [0.05853, 0.05973, 0.05853, 0.05973, 0.05853, 0.05973]];
        selllist = [[0.06111, 0.05991, 0.06111, 0.05991, 0.06111, 0.05991],
            [0.06231, 0.06111, 0.06231, 0.06111, 0.06231, 0.06111],
            [0.06351, 0.06231, 0.06351, 0.06231, 0.06351, 0.06231]];

        var db = M.pool.getConnection();
        try {
            var sql = "delete from prelist";
            var data = yield db.query(sql);
            for (var i = 0; i < buylist.length; i++) {
                var sql = "insert into prelist (flg, price1, price2)values(?,?,?)";
                var data = yield db.query(sql, [1, buylist[i][0], buylist[i][1]]);
            }
            for (var i = 0; i < selllist.length; i++) {
                var sql = "insert into prelist (flg, price1, price2)values(?,?,?)";
                var data = yield db.query(sql, [0, selllist[i][0], selllist[i][1]]);
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        console.log('数据库写入成功！');

    },
    checkOrder: function*(market) {
        var db = M.pool.getConnection();
        try {
            var sql = "SELECT * FROM orderlist";
            var data = yield db.query(sql);
            data = data[0];
            //console.log(data);
            var orderList = yield yunbiService.getOrderList(market);
            orderList = JSON.parse(orderList);

            console.log('大小：' + orderList.length);
            // console.log(orderList);
            for (var i = 0; i < data.length; i++) {
                var busid = data[i].busid;
                var _count = 0;
                for (var j = 0; j < orderList.length; j++) {
                    if (busid == orderList[j].id) {
                        console.log('存在\t\t' + busid)
                        _count = _count + 1;
                    }
                }
                if (_count == 0) {
                    //交易成功了;
                }
            }
        } finally {
            M.pool.releaseConnection(db);
        }
    },
    autoBuss: function*() {
        //自动交易代码；
        //检索交易队列queue;
        var db = M.pool.getConnection();
        console.log("**********************START**********************");
        try {
            var queue = yield yunbiService.getQueueList(db, '1', '1');
            // console.log('1 \t', queue);
            if (queue.length == 0) return;
            for (var i = 0; i < queue.length; i++) {
                var market = queue[i].market;
                var queuedetail = yield  yunbiService.getQueueDetail(db, queue[i].id);
                var isWaiting = false;
                for (var j = 0; j < queuedetail.length; j++) {
                    //判断如果已经有正在等待交易的，那么继续等待;
                    if (queuedetail[j].status == '1') {
                        isWaiting = true;
                    }
                }
                if (isWaiting == true) continue;
                for (var j = 0; j < queuedetail.length; j++) {

                    if (queuedetail[j].status == '0') {
                        isWaiting = true;
                        //创建这个订单;创建完毕之后退出循环，对另外一个队列创建订单;
                        console.log('正在创建订单系统ID:\t\t' + queuedetail[j].id);
                        var createOrderData = yield yunbiService.createOrder(queuedetail[j].side, market, queuedetail[j].volume, queuedetail[j].price);
                        createOrderData = JSON.parse(createOrderData);
                        var bussid = createOrderData.id;
                        if (bussid === undefined) break;
                        var created_at = new Date(createOrderData.created_at);
                        var updateData = yield yunbiService.updateQueryDetail(db, queuedetail[j].id, bussid, created_at, '1');
                        if (updateData.affectedRows == 1) {
                            console.log('订单创建成功：系统ID:\t\t' + queuedetail[j].id);
                        }
                        break;
                    }
                }
            }
        } finally {
            M.pool.releaseConnection(db);
        }
        console.log("************************END********************");
    },
    checBuss: function*() {
        var db = M.pool.getConnection();
        try {
            var allWaitQueueData = yield yunbiService.getAllWaitQueueList(db, '1', '1');
            for (var i = 0; i < allWaitQueueData.length; i++) {
                var serverInfo = yield yunbiService.getOrderInfoFromServerById(allWaitQueueData[i].bussid);
                serverInfo = JSON.parse(serverInfo);

                var state = serverInfo.state;
                if (state === 'cancel') {
                    yield yunbiService.updateQueryDetailStatus(db, allWaitQueueData[i].id, '-1');
                }
                if (state === 'done') {
                    yield yunbiService.updateQueryDetailStatus(db, allWaitQueueData[i].id, '2');
                }
            }
        } finally {
            M.pool.releaseConnection(db);
        }
    },
    insertDoneOrder: function*() {
        var orderList = yield yunbiService.getOrderList('sccny', 'done');
        orderList = JSON.parse(orderList);
        var db = M.pool.getConnection();
        try {
            for (var i = 0; i < orderList.length; i++) {
                var log = orderList[i];
                var sql = "insert into busslog (market,rq, buy, high, low, sell, last, vol)values(?,?,?,?,?,?,?,?)";
                var data = yield db.query(sql, [market, date, result.ticker.buy, result.ticker.high, result.ticker.low, result.ticker.sell, result.ticker.last, result.ticker.vol]);
                this.body = data[0];

            }
        } finally {
            M.pool.releaseConnection(db);
        }

    },
    getAllTickers: function*(exchange, market) {
        var data = yield tickService.getAllTickers(exchange, market);
        console.log(data);
        return data;
    },
    startRequestEthPool: function *() {
        //每小时最大的发送次数;
        var maxSendCountHour = 10;
        //等待15分钟如果还收不到数据认为死机了;
        var maxWaitTime = 15;
        var data = yield netpullService.startRequestEthPool();
        if (data.code != '0000') return;
        var data = data.data[0];
        var max = 0;
        var underLine = [];
        data.forEach(function (info, index) {

            if (info.currentData == 0) {
                underLine.push(info.name);
            } else if (Number(info.lasttime) >= maxWaitTime) {
                //如果15分钟没有收到客户端消息也任务死机了;
                underLine.push(info.name);
                info.currentData = 0;
            }
            max = max + Number(_.isEmpty(info.currentData) ? 0 : info.currentData);
        });
        var max = (max / 1000).toFixed(2) + 'G';
        console.log('当前在线' + data.length + '合计:' + max);
        // underLine.push('D01');
        // underLine.push("D02");
        if (C.isaliSms == false) return;
        //死机小于几台的时候不发送;
        if (underLine.length < 1) return;
        var _list = '0';
        var cnt = '';
        var key1 = '0';
        if (underLine.length >= 4) {
            cnt = underLine[0] + underLine[1];
            key1 = underLine[2] + underLine[3];
        } else if (underLine.length == 3) {
            cnt = underLine[0] + underLine[1];
            key1 = underLine[2]
        } else if (underLine.length == 2) {
            cnt = underLine[0] + underLine[1];
            key1 = '';
        } else if (underLine.length == 1) {
            cnt = underLine[0];
            key1 = '0';
        }

        var params = {
            time: M.moment().format('MM-DD hh:mm'),
            count: underLine.length,
            cnt: cnt,
            key: key1,
        }
        const accessKeyId = C.alismsaccessKeyId;
        const secretAccessKey = C.alismssecretAccessKey;
        var smsClient = new _.aliSMSClient({accessKeyId, secretAccessKey});

        var hour = M.moment().format('YYYYMMDDHH');

        var _hour = Number(M.moment().format('HH'));
        if (C.isaliSms == false) return;
        if (_hour > 0 && _hour < 6) {
            //半夜不发消息;
            return;
        }


        if (G.sendCountHour == undefined) {
            G.sendCountHour = {};
        }
        if (G.sendCountHour[hour] == undefined) {
            G.sendCountHour[hour] = 0;
        }

        if (G.sendCountHour[hour] > maxSendCountHour) {
            //已经发送的大于最大发送量的时候退出;
            console.log('次数已满！');
            return;
        }

        var _tmp = hour + '_' + cnt + '_' + key1;
        if (G.sendCountHour[_tmp] == undefined) {
            G.sendCountHour[_tmp] = 0;
        }

        console.log(G.sendCountHour);
        if (G.sendCountHour[_tmp] >= 1) {
            console.log('相同消息已经重复发送过了!');
            return;
        }

        G.sendCountHour[hour] = Number(G.sendCountHour[hour]) + 1;
        G.sendCountHour[_tmp] = G.sendCountHour[_tmp] + 1;
        console.log('开始发送短信' + M.moment().format('YYYYMMDDHHmm'));
        console.log(JSON.stringify(params));


        var data = yield messageService.sendServiceExceptionMessage(underLine.length > 0 ? '异常服务器:' + underLine.toString() : '');
        console.log(data);

        /*
         smsClient.sendSMS({
         PhoneNumbers: '13099590292,13895671864',
         SignName: '码农',
         TemplateCode: 'SMS_81495007',
         TemplateParam: JSON.stringify(params)
         }).then(function (res) {
         let {Code} = res
         if (Code === 'OK') {
         //处理返回参数
         console.log(res)
         }
         }, function (err) {
         console.log(err)
         })
         */


    },
    startRequestEthPoolHour: function *() {
        var data = yield netpullService.startRequestEthPool();
        //等待15分钟如果还收不到数据认为死机了;
        var maxWaitTime = 15;
        if (data.code != '0000') return;
        var data = data.data[0];
        var max = 0;
        var underLine = [];
        data.forEach(function (info, index) {

            if (info.currentData == 0) {
                underLine.push(info.name);
            } else if (Number(info.lasttime) >= maxWaitTime) {
                //如果10分钟没有收到客户端消息也任务死机了;
                underLine.push(info.name);
                info.currentData = 0;
            }
            max = max + Number(_.isEmpty(info.currentData) ? 0 : info.currentData);
        });
        var max = (max / 1000).toFixed(2) + 'G';
        console.log('当前在线' + data.length + '合计:' + max);

        if (C.isaliSms == false) return;
        var _list = '0';
        if (underLine.length > 0) {
            _list = underLine.length + ',' + underLine.toString();
            _list = _list.substr(0, 6);
        }

        var params = {
            time: M.moment().format('MM-DD hh:mm'),
            count: data.length,
            max: max,
            list: _list
        }
        var _hour = Number(M.moment().format('HH'));
        if (_hour > 0 && _hour < 6) {
            //半夜不发消息;
            return
        }
        console.log(params);
        const accessKeyId = C.alismsaccessKeyId;
        const secretAccessKey = C.alismssecretAccessKey;
        var smsClient = new _.aliSMSClient({accessKeyId, secretAccessKey});
        console.log('发送每小时短信！');
        _list = '';
        if (underLine.length > 0) {
            _list = underLine.toString();
            _list = "不在线:" + _list;
        }
        var data = yield messageService.sendServiceRunMessage(data.length + '台', '算力:' + max, _list)
        /*smsClient.sendSMS({
         PhoneNumbers: '13895652926,13895671864',
         SignName: '码农',
         TemplateCode: 'SMS_80975015',
         TemplateParam: JSON.stringify(params)
         }).then(function (res) {
         let {Code} = res
         if (Code === 'OK') {
         //处理返回参数
         console.log(res)
         }
         }, function (err) {
         console.log(err)
         })*/


    },
    startRequestYunBiKLine: function*() {
        var _data = yield netpullService.startRequestYunBi();
        console.log(_data);

    },
    autoListenerOrder: function*() {
        //第一次买入100元,如果买入成功,那么在(3%)103的地方卖,当跌到(1%)99 的时候那么把103的撤销了
        // 同时在(0.9988的地方卖了)(98.8812) ;
        console.log("autoListenerOrder start********************************");


        var db = M.pool.getConnection();
        var sql = '';
        try {
            var _yunbiOrderHead = yunbiOrderHead;
            var orderList = yield _yunbiOrderHead.queryUnComplete(db);
            if (orderList.length == 0) {
                this.body = _.biz.outjson('0000', '', []);
                return;
            }

            //循环数组;
            for (i = 0; i < orderList.length; i++) {
                var item = orderList[i];
                var orderstatus = item.orderstatus;
                if (orderstatus === '0') {
                    console.log('开始买入');
                    var data = yield yunbiService.createOrder('buy', item.market, item.volume, item.buyprice);
                    data = JSON.parse(data);
                    if (data.id != undefined) {
                        sql = 'update orderhead set bussid = ? , orderstatus = ? where id=? ';
                        var _data = yield _yunbiOrderHead.executeSqlx(db, sql, [data.id, '1', item.id]);
                    }

                } else if (orderstatus === '1') {
                    console.log('等待买入订单状态');
                    //去查询这个订单是否交易成功?
                    var data = yield yunbiService.getOrderInfoFromServerById(item.bussid);
                    data = JSON.parse(data);
                    if (data.state === 'done') {
                        sql = 'update orderhead set orderstatus = ? where id=? ';
                        var _data = yield _yunbiOrderHead.executeSqlx(db, sql, ['2', item.id]);
                    } else if (data.state === 'wait') {
                        console.log('继续等待买入订单状态');
                    } else {
                        console.log('订单状态不对');
                    }
                } else if (orderstatus === '2' || orderstatus == '3' || orderstatus == '4') {
                    //获取当前价格;
                    //如果目前价格大于等于买入价格 那么执行卖出高价;

                    var _currentPrice = yield yunbiService.getTickers((item.market).substr(0, (item.market).length - 3));
                    if (_currentPrice.code = '0000') {
                        _currentPrice = _currentPrice.data[0].ticker.sell;
                    } else {
                        return;
                    }
                    console.log('当前价格:' + _currentPrice);

                    if (orderstatus === '2' && _currentPrice >= item.buyprice) {
                        //更新状态=3 (高价卖状态)
                        console.log('卖出高价');
                        var data = yield yunbiService.createOrder('sell', item.market, item.volume, item.upprice);
                        data = JSON.parse(data);
                        if (data.id != undefined) {
                            sql = 'update orderhead set upbussid = ? , orderstatus = ? where id=? ';
                            var _data = yield _yunbiOrderHead.executeSqlx(db, sql, [data.id, '3', item.id]);
                        }
                    } else if (orderstatus === '3') {
                        if (_currentPrice >= item.buyprice) {
                            //检索是否成功了;
                            console.log('检索高价交易是否成功了?');
                            //成功之后更新状态 = 9 ;
                            var data = yield yunbiService.getOrderInfoFromServerById(item.upbussid);
                            data = JSON.parse(data);
                            if (data.state === 'done') {
                                sql = 'update orderhead set orderstatus = ? where id=? ';
                                var _data = yield _yunbiOrderHead.executeSqlx(db, sql, ['9', item.id]);
                            } else if (data.state === 'wait') {
                                console.log('继续等待高价卖出订单状态');
                            } else {
                                console.log('订单状态不对');
                            }
                        } else {
                            //撤销高价订单;
                            //撤销订单;修改标志为2 ,.upbussid = 0 ;
                            console.log('撤销高价订单');
                            var data = yield yunbiService.cancelOrderById(item.upbussid);
                            data = JSON.parse(data);
                            if (data.id != undefined) {
                                console.log('更新订单标志');
                                sql = 'update orderhead set upbussid = ? , orderstatus = ? where id=? ';
                                var _data = yield _yunbiOrderHead.executeSqlx(db, sql, ['0', '2', item.id]);
                            }
                        }
                    } else if (orderstatus === '4') {
                        if (_currentPrice >= item.buyprice) {
                            console.log('撤销低价订单')
                            //撤销低价订单;
                            //撤销订单;修改标志为2 ,.sellbussid = 0 ;
                            var data = yield yunbiService.cancelOrderById(item.sellbussid);
                            data = JSON.parse(data);
                            if (data.id != undefined) {
                                sql = 'update orderhead set sellbussid = ? , orderstatus = ? where id=? ';
                                var _data = yield _yunbiOrderHead.executeSqlx(db, sql, ['0', '2', item.id]);
                            }
                        } else {
                            console.log('继续等待看低价订单是否交易成功了');
                            //继续等待看是否交易成功了;
                            //成功更新状态= 9 ;
                            var data = yield yunbiService.getOrderInfoFromServerById(item.sellbussid);
                            data = JSON.parse(data);
                            if (data.state === 'done') {
                                sql = 'update orderhead set  orderstatus = ? where id=? ';
                                var _data = yield _yunbiOrderHead.executeSqlx(db, sql, ['9', item.id]);
                            } else if (data.state === 'wait') {
                                console.log('继续等待低价订单订单状态');
                            } else {
                                console.log('订单状态不对');
                            }
                        }
                    } else {
                        //等待订单如果降低到一定范围则卖出;
                        if (_currentPrice <= item.downrangeprice) {
                            console.log('开始挂单低价卖出');
                            //orderstatus =4 , sellbussid ='xxx';
                            var data = yield yunbiService.createOrder('sell', item.market, item.volume, item.downprice);
                            data = JSON.parse(data);
                            if (data.id != undefined) {
                                sql = 'update orderhead set sellbussid = ? ,orderstatus = ? where id=? ';
                                var _data = yield _yunbiOrderHead.executeSqlx(db, sql, [data.id, '4', item.id]);
                            }
                        } else {
                            console.log('继续等待低价卖出状态;', _currentPrice, item.downrangeprice, _currentPrice - item.downrangeprice);
                        }
                    }
                }
            }
            ;
        } finally {
            M.pool.releaseConnection(db);
        }

        console.log("autoListenerOrder end----------------------------------");
    },
    saveAllYunBiTicket: function*() {
        //把云币所有的交易记录都保存到数据库里面;
        var url = 'https://yunbi.com//api/v2/tickers.json';
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
        //console.log(result);
        var count = 0;
        var params = [];
        if (G['dbkey'] == undefined) {

            G['dbkey'] = [];
        }
        if ((G['dbkey']).length > 200) {
            console.log('xxx', G['dbkey'].length);
            G['dbkey'] = G['dbkey'].slice(160, G['dbkey'].length);
        }

        for (key in result) {
            if (key == 'zmccny') {
                continue;
            }
            var ticker = result[key].ticker;
            var at = result[key].at;
            var date = new Date(parseInt(at * 1000));
            var sDbKey = key + date;
            var sDbKeyCount = 0;
            if (G.dbkey.length > 0) {

                G.dbkey.forEach(function (item) {
                    if (sDbKeyCount == 0 && item == key) {
                        console.log('一致跳出循环');
                        sDbKeyCount++;
                    }
                })
            }
            if (sDbKeyCount > 0)continue;
            G['dbkey'].push(sDbKey);
            count++;
            params.push(key);
            params.push(date);
            params.push(ticker.buy);
            params.push(ticker.high);
            params.push(ticker.low);
            params.push(ticker.sell);
            params.push(ticker.last);
            params.push(ticker.vol);
        }

        var market = '1';
        var date = new Date(parseInt(result.at * 1000));
        var sV = '';
        for (i = 0; i < count; i++) {
            sV = sV + '(?,?,?,?,?,?,?,?),';
        }
        sV = sV.substr(0, sV.length - 1);


        var db = M.pool.getConnection();
        try {
            var sql = "insert into busslog (market,rq, buy, high, low, sell, last, vol)values" + sV;

            //console.log(params);
            var data = yield db.query(sql, params);
            this.body = data[0];
            var insertCount = data[0].affectedRows;
            if (insertCount === 0) {
                console.log('true');
            }
            if (insertCount === 0) {
                console.log('插入失败!', insertCount);
            } else {
                console.log('插入' + insertCount + '条数据' + new Date());
            }
        } finally {
            M.pool.releaseConnection(db);
        }
    },
    autoListenerMyChbtcOrder: function*() {
        //var orderList = yield chBtcService.getOrdersIgnoreTradeType('btc');
        //yield chBtcService.getOrder('btc',20170902910480052);
        //yield chBtcService.order('buy','bts',1,0.01);
        yield chBtcService.cancelOrder('bts', 2017090620937512);
    },
    listnerBinaner: function*() {

        //console.log('start', G.startBinance);
        if (G.bianceList != undefined && G.bianceList.length > 0) {

            console.log('待插入数据: ' + G.bianceList.length);
            if (G.bianceList.length > 5) {
                let list = [];
                list.push(G.bianceList.pop());
                list.push(G.bianceList.pop());
                list.push(G.bianceList.pop());
                list.push(G.bianceList.pop());
                list.push(G.bianceList.pop());

                let values = [];
                for (i = 0; i < list.length; i++) {
                    let {e: eventType, E: eventTime, s: symbol, k: ticks} = list[i];
                    let {o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime} = ticks;
                    if (symbol.substr(symbol.length - 3, 3) == 'BTC') {
                        open = open * G.binance.btc;
                        close = close * G.binance.btc;
                        high = high * G.binance.btc;
                        low = low * G.binance.btc;
                    }
                    values.push(symbol);
                    values.push(M.moment(endTime).format('YYYY-MM-DD HH:mm:ss'));
                    values.push(parseFloat(open).toFixed(10));
                    values.push(parseFloat(close).toFixed(10));
                    values.push(parseFloat(high).toFixed(10));
                    values.push(parseFloat(low).toFixed(10));
                    values.push(volume);
                    values.push(interval);
                }

                const sql = 'insert into binaner (market,startTime,open,close,high,low,volume,intval) values(?,?,?,?,?,?,?,?),(?,?,?,?,?,?,?,?),(?,?,?,?,?,?,?,?),(?,?,?,?,?,?,?,?),(?,?,?,?,?,?,?,?)';
                const params = values;
                try {
                    var db = M.pool.getConnection();
                    yield db.query(sql, params);
                } finally {
                    M.pool.releaseConnection(db);
                }
            }else {
                const candlesticks = G.bianceList.pop();
                let {e: eventType, E: eventTime, s: symbol, k: ticks} = candlesticks ;
                let {o: open, h: high, l: low, c: close, v: volume, n: trades, i: interval, x: isFinal, q: quoteVolume, V: buyVolume, Q: quoteBuyVolume, t: startTime, T: endTime} = ticks;
                if (symbol.substr(symbol.length - 3, 3) == 'BTC') {
                    open = open * G.binance.btc;
                    close = close * G.binance.btc;
                    high = high * G.binance.btc;
                    low = low * G.binance.btc;
                }
                let values = [];
                values.push(symbol);
                values.push(M.moment(endTime).format('YYYY-MM-DD HH:mm:ss'));
                values.push(parseFloat(open).toFixed(10));
                values.push(parseFloat(close).toFixed(10));
                values.push(parseFloat(high).toFixed(10));
                values.push(parseFloat(low).toFixed(10));
                values.push(volume );
                values.push(interval);

                const sql = 'insert into binaner (market,startTime,open,close,high,low,volume,intval) values(?,?,?,?,?,?,?,?)';
                const params = values;
                try {
                    var db = M.pool.getConnection();
                    yield db.query(sql, params);
                } finally {
                    M.pool.releaseConnection(db);
                }
            }
        }

        //const listKey = ['BTCUSDT','XRPBTC', 'XVGBTC', 'ETHBTC', 'ADABTC', 'POEBTC', 'TRXBTC', 'XLMBTC', 'IOTABTC', 'BCCBTC', 'NEOBTC', 'LTCBTC', 'QTUMBTC', 'VENBTC', 'HSRBTC', 'FUNBTC', 'LENDBTC', 'ELFBTC', 'STORJBTC', 'ICXBTC', 'BNBBTC', 'EOSBTC', 'CNDBTC', 'QSPBTC', 'TNBBTC', 'MCOBTC', 'MODBTC', 'OMGBTC', 'BTSBTC', 'DASHBTC', 'XMRBTC', 'MANABTC', 'SALTBTC', 'REQBTC', 'ETCBTC', 'LSKBTC', 'BRDBTC', 'ENGBTC', 'AIONBTC', 'SNTBTC', 'WTCBTC', 'ENJBTC', 'ADXBTC', 'STRATBTC', 'OSTBTC', 'BQXBTC', 'TNTBTC', 'ZRXBTC', 'LINKBTC', 'FUELBTC', 'BTGBTC', 'ARKBTC', 'XZCBTC', 'ASTBTC', 'SUBBTC', 'CDTBTC', 'TRIGBTC', 'POWRBTC', 'KMDBTC', 'VIBBTC', 'CTRBTC', 'RCNBTC', 'WINGSBTC', 'GTOBTC', 'WABIBTC', 'BATBTC', 'LRCBTC', 'MTHBTC', 'ZECBTC', 'RDNBTC', 'KNCBTC', 'CMTBTC', 'MTLBTC', 'DNTBTC', 'GASBTC', 'WAVESBTC', 'SNMBTC', 'MDABTC', 'YOYOBTC', 'LUNBTC', 'SNGLSBTC', 'NAVBTC', 'NULSBTC', 'DGDBTC', 'BNTBTC', 'BCPTBTC', 'ICNBTC', 'AMBBTC', 'GXSBTC', 'GVTBTC', 'ARNBTC', 'EVXBTC', 'PPTBTC', 'NEBLBTC', 'BCDBTC', 'EDOBTC', 'OAXBTC', 'DLTBTC'];
        //const listKey = ['BTCUSDT', 'XRPBTC', 'XVGBTC','ADABTC', 'POEBTC', 'TRXBTC', 'XLMBTC', 'IOTABTC'];
        const listKey = ['BTCUSDT','TRXBTC', 'CNDBTC', 'ETHBTC', 'XRPBTC', 'VIBEBTC', 'NEOBTC', 'BNBBTC', 'VENBTC', 'ELFBTC', 'EOSBTC', 'POEBTC', 'ICXBTC', 'XVGBTC', 'ADABTC', 'INSBTC', 'TNBBTC', 'WTCBTC', 'CDTBTC', 'LTCBTC', 'HSRBTC', 'XLMBTC', 'APPCBTC', 'FUNBTC', 'ETCBTC', 'BCCBTC', 'BTGBTC', 'IOTABTC', 'GTOBTC', 'BCDBTC', 'QTUMBTC', 'XMRBTC', 'AMBBTC', 'BCPTBTC', 'ARNBTC', 'BRDBTC', 'OMGBTC', 'KNCBTC', 'NEBLBTC', 'LENDBTC', 'LRCBTC', 'ZRXBTC', 'BTSBTC', 'AIONBTC', 'REQBTC', 'CTRBTC', 'QSPBTC', 'EVXBTC', 'SALTBTC', 'ENGBTC', 'WABIBTC', 'ZECBTC', 'DNTBTC', 'TRIGBTC', 'OSTBTC', 'MTHBTC', 'LINKBTC', 'MANABTC', 'STORJBTC', 'NULSBTC', 'GASBTC', 'POWRBTC', 'ICNBTC', 'SUBBTC', 'STRATBTC', 'MTLBTC', 'LSKBTC', 'WINGSBTC', 'DASHBTC', 'ENJBTC', 'BQXBTC', 'CMTBTC', 'FUELBTC', 'MCOBTC', 'DLTBTC', 'YOYOBTC', 'SNTBTC', 'BATBTC', 'EDOBTC', 'TNTBTC', 'ADXBTC', 'RLCBTC', 'GXSBTC', 'ASTBTC', 'WAVESBTC', 'SNMBTC', 'ARKBTC', 'RCNBTC', 'MODBTC', 'KMDBTC', 'RDNBTC', 'MDABTC', 'LUNBTC', 'SNGLSBTC', 'VIBBTC', 'GVTBTC', 'NAVBTC', 'XZCBTC', 'PPTBTC', 'OAXBTC', 'BNTBTC', 'DGDBTC']
        if (G.startBinance == undefined) {
            G.startBinance = false;
        }
        if (G.startBinance) return;
        try {
            G.startBinance = true;
            console.log("execute");
            var promise = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "1m", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    /*console.log(symbol + " " + interval + " candlestick update");
                     console.log(M.moment(startTime).format('YYYY-MM-DD HH:mm:ss') + '至' + M.moment(endTime).format('YYYY-MM-DD HH:mm:ss'));
                     console.log("open: " + open);
                     console.log("high: " + high);
                     console.log("low: " + low);
                     console.log("close: " + close);
                     console.log("volume: " + volume);*/
                    //console.log("isFinal: " + isFinal);
                    resolve(candlesticks);

                });
            });

            var promise30m = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "30m", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    resolve(candlesticks);

                });
            });

            var promise1h = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "1h", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    resolve(candlesticks);

                });
            });

            var promise4h = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "4h", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    resolve(candlesticks);

                });
            });

            var promise12h = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "12h", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    resolve(candlesticks);

                });
            });


            var promise1d = new Promise(function (resolve, reject) {
                binance.websockets.candlesticks(listKey, "1d", function (candlesticks) {

                    let {k: ticks, s: symbol} = candlesticks;
                    let {x: isFinal, c: close} = ticks;
                    if (symbol == 'BTCUSDT') {
                        G.binance = {
                            btc: close
                        }
                    }
                    if (isFinal) {
                        if (G.bianceList == undefined) G.bianceList = [];
                        G.bianceList.push(candlesticks);
                    }
                    resolve(candlesticks);

                });
            });
        } catch (e) {
            console.log(e);
            G.startBinance = false;
        }

    }

}