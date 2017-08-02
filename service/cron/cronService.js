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
        var maxSendCountHour = 4;
        var data = yield netpullService.startRequestEthPool();
        if (data.code != '0000') return;
        var data = data.data[0];
        var max = 0;
        var underLine = [];
        data.forEach(function (info, index) {
            max = max + Number(info.currentData);
            if (info.currentData == 0) {
                underLine.push(info.name);
            }
        });
        var max = (max / 1000).toFixed(2) + 'G';
        console.log('当前在线' + data.length + '合计:' + max);
        if (C.isaliSms == false) return;
        //死机小于几台的时候不发送;
        if (underLine.length < 1) return;
        var _list = '0';
        var cnt = '';
        var key1 = '';
        if (underLine.length >= 4) {
            cnt = underLine[0] + underLine[1];
            key1 = underLine[2] + underLine[3];
        } else if (underLine.length == 3) {
            cnt = underLine[0] + underLine[1];
            key1 = underLine[2]
        } else if (underLine.length == 2) {
            console.log('xxx', key1);
            cnt = underLine[0] + underLine[1];
            key1 = '';
        } else if (underLine.length == 1) {
            cnt = underLine[0];
            key1 = '';
        }

        var params = {
            count: underLine.length,
            cnt: cnt,
            key: key1,
        }
        const accessKeyId = C.alismsaccessKeyId;
        const secretAccessKey = C.alismssecretAccessKey;
        var smsClient = new _.aliSMSClient({accessKeyId, secretAccessKey});

        var hour = M.moment().format('YYYYMMDDHH');
        console.log(hour);
        var _hour = M.moment().format('HH');
        if (_hour > 0 && _hour <6){
            //半夜不发消息;
            return ;
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
        if (C.isaliSms == false) return;

        G.sendCountHour[hour] = Number(G.sendCountHour[hour]) + 1;
        console.log('开始发送短信' + M.moment().format('YYYYMMDDHHmm'));
        smsClient.sendSMS({
            PhoneNumbers: '13895652926,13895671864',
            SignName: '码农',
            TemplateCode: 'SMS_80795024',
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


    },
    startRequestEthPoolHour: function *() {
        var data = yield netpullService.startRequestEthPool();
        if (data.code != '0000') return;
        var data = data.data[0];
        var max = 0;
        var underLine = [];
        data.forEach(function (info, index) {
            max = max + Number(info.currentData)
            if (info.currentData == 0) {
                underLine.push(info.name);
            }
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
        console.log(params);
        const accessKeyId = C.alismsaccessKeyId;
        const secretAccessKey = C.alismssecretAccessKey;
        var smsClient = new _.aliSMSClient({accessKeyId, secretAccessKey});
        console.log('发送每小时短信！');
        smsClient.sendSMS({
         PhoneNumbers: '13895652926,13895671864',
         SignName: '码农',
         TemplateCode: 'SMS_80975015',
         TemplateParam: JSON.stringify(params)
         }).then(function (res) {
         let {Code}=res
         if (Code === 'OK') {
         //处理返回参数
         console.log(res)
         }
         }, function (err) {
         console.log(err)
         })


    }
}