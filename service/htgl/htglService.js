/**
 * Created by Administrator on 2016-04-12.
 */
module.exports = function (self) {
    return {
        getCode:function*(){
            var APPID="wx96339f6e3e393d60";
            var REDIRECT_URI ="http://nxycdl.ngrok.cc/htgl/index/gotoMain";
            var url="https://open.weixin.qq.com/connect/oauth2/authorize?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=SCOPE&state=STATE#wechat_redirect";
            url = url.replace('APPID',APPID);
            url = url.replace('REDIRECT_URI',REDIRECT_URI);
            console.log(url) ;
            //通过微信获取微信用户的唯一标识
            var result = yield M.request({
                uri: url,
                method: 'get'
            });
            if(result.statusCode == 200) {
                console.log(result);
                var body = JSON.parse(result.body);
                console.log(body);
            }
            return 0;
        },
        getWeiXinAccess_token:function * (code){
            var APPID="wx96339f6e3e393d60";
            var SECRET="4536a35ce5418d49a7ecd300b01e98e4";
            var CODE=code;
            var url="https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code";
            var url = url.replace('APPID',APPID);
            url = url.replace('SECRET',SECRET);
            url = url.replace('CODE',CODE);
            console.log(url) ;
            //通过微信获取微信用户的唯一标识
            var result = yield M.request({
                uri: url,
                method: 'get'
            });
            //console.log("result:" + JSON.stringify(result));
            if(result.statusCode == 200) {
                var body = JSON.parse(result.body);
                var user = new Object();
                if(_.isEmpty(result.body.errcode)){
                    user = body;
                    //console.log(user);
                }
            }else{
                user.errcode = body.errcode;
                user.errmsg = body.errmsg;
            }
            return user;
        }
    }
}