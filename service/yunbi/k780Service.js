/**
 * Created by dl on 2017-08-09.
 */
module.exports=function(self){
    return {
        getUSDtoCny:function*(){
            /**
             * 美元到人民币汇率查询;
             * @type {string}
             */
            //http://www.k780.com/api/finance.rate
            url= 'http://api.k780.com:88/?app=finance.rate&scur=USD&tcur=CNY&appkey=10003&sign=b59bc3ef6191eb9f747dd4e83c99f2a4';
            var result = {
                success:1,
                result:{
                    rate:0
                }
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
                return _.biz.outjson('-1', e, {rate:0});
            }
            if (result.body.length == 0) {
                return _.biz.outjson('0000', '',{rate:0});
            }
            result = JSON.parse(result.body);
            return _.biz.outjson('0000', '',result.result.rate);
        }
    }
}