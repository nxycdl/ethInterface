/**
 * Created by Administrator on 2016-08-21.
 */
module.exports = function (self) {
    return {
        /**
         * 获取微信Access_token 如果从weixinCacheToken获取不到，或是token还有3分钟过期，那么重新从网络获取token；
         * @returns {string|*}
         */
        getAccess_token:function*() {
            var filePath = C.weixinCacheToken;
            var winxinToken = JSON.parse(M.fs.readFileSync(filePath));
            var date_value = winxinToken.date_value;
            var expires_in = winxinToken.expires_in;
            var dateNow_value = new Date().valueOf();
            //如果还差3分钟过期，那么重新获取一次;
            if (Math.round((dateNow_value - date_value) / 1000) > expires_in - 180) {
                winxinToken = yield this.getAccess_tokenByNet(true);
            }
            console.log("获取微信token:" + winxinToken.access_token);
            return winxinToken.access_token;

        },
        getAccess_tokenByNet: function*(bWrite) {
            console.log("getAccess_tokenByNet");
            var url = "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET";
            url = url.replace('APPID', C.appId);
            url = url.replace('APPSECRET', C.appSecret);
            var result = yield M.request({
                uri: url,
                method: 'get'
            });
            var winxinToken = JSON.parse(result.body);
            if (bWrite===true){
                winxinToken.date_value = new Date().valueOf();
                M.fs.writeFileSync(C.weixinCacheToken, JSON.stringify(winxinToken));
            }
            return winxinToken;
        },
        getJsApi_ticket:function*(access_token) {
            var weixinJsApi_ticket = JSON.parse(M.fs.readFileSync(C.weixinJsApi_ticket));
            var date_value = weixinJsApi_ticket.date_value;
            var expires_in = weixinJsApi_ticket.expires_in;
            var dateNow_value = new Date().valueOf();
            //如果还差3分钟过期，那么重新获取一次;
            if (Math.round((dateNow_value - date_value) / 1000) > expires_in - 180) {
                weixinJsApi_ticket = yield this.getJsApi_ticketByNet(access_token,true);
            }
            console.log("获取微信JsApi_ticket:" + weixinJsApi_ticket.ticket);
            return weixinJsApi_ticket.ticket;

        },
        getJsApi_ticketByNet: function*(access_token,bWrite) {
            console.log("getJsApi_ticketByNet");
            var url = "https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=ACCESS_TOKEN&type=jsapi";
            url = url.replace('ACCESS_TOKEN', access_token);

            var result = yield M.request({
                uri: url,
                method: 'get'
            });
            var weixinJsApi_ticket = JSON.parse(result.body);

            if (bWrite===true){
                weixinJsApi_ticket.date_value = new Date().valueOf();

                M.fs.writeFileSync(C.weixinJsApi_ticket, JSON.stringify(weixinJsApi_ticket));
            }
            return weixinJsApi_ticket;
        }
    }
}
