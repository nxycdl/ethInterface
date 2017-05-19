/**
 * Created by dl on 2017-01-04.
 */
var wxUtils = require(C.service + 'weixin/wxUtils')();
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
    job3: function*() {
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
        console.log(date);
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