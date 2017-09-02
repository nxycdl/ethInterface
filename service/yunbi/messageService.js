/**
 * Created by dl on 2017-08-07.
 */
module.exports = function (self) {
    return {
        sendServiceExceptionMessage: function*(message) {
            var postData = {
                message: message
            }
            var result = yield M.request({
                uri: C.myConfig.messageService + '/weijz/index/sendServerExceptionMessage',
                method: 'post',
                form: postData
            });
            var body = {};
            if (result.statusCode == 200) {
                body = JSON.parse(result.body);
                console.log(body);
            } else {

            }
            return body;
        },
        sendServiceRunMessage: function*(count,ability,message) {
            var postData = {
                count:count,
                ability:ability,
                message: message
            }
            var result = yield M.request({
                uri: C.myConfig.messageService + '/weijz/index/sendServerRunStatusMessage',
                method: 'post',
                form: postData
            });
            var body = {};
            if (result.statusCode == 200) {
                body = JSON.parse(result.body);
                console.log(body);
            } else {

            }
            return body;
        },
        sendBTCDiffMessage: function*(caption,keyword1,message) {
            postData = {
                caption: caption,
                keyword1: keyword1,
                message: message
            }
            console.log('发送消息');
            try {
                var result = yield M.request({
                    uri: C.myConfig.messageService + '/weijz/index/sendBTCDiffPriceMessage',
                    method: 'post',
                    timeout: 2000,
                    form: postData
                });
                var body = {};
                if (result.statusCode == 200) {
                    body = JSON.parse(result.body);
                    console.log(body);
                } else {
                    return _.F.outjson(result.statusCode, [])
                }
            }catch (e){
                console.log('e',e)
                return _.biz.outjson(e.message, [])
            }
            return body;

        }
    }
}