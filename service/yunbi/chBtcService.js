/**
 * Created by dl on 2017-08-01.
 */
const secret_key = '4b41f9b5-5a1a-4f52-bf3a-147cad90350b';
const access_key = '879042e6-52ef-4e60-8408-6ab918ba32e1';
module.exports = function (self) {
    return {
        getChbtcTickers: function*(market) {
            market = market + '_cny';
            var url = 'http://api.chbtc.com/data/v1/ticker?currency=' + market;
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
                return _.biz.outjson('-1', e, []);
            }
            if (result.body.length == 0) {
                return _.biz.outjson('0000', '', []);
            }
            result = JSON.parse(result.body);

            return _.biz.outjson('0000', '', result);
        },
        getUnfinishedOrdersIgnoreTradeType: function*(market) {
            market = market + '_cny';
            var url ='https://trade.chbtc.com/api/getUnfinishedOrdersIgnoreTradeType?';
            var params= 'method=getUnfinishedOrdersIgnoreTradeType&accesskey='+C.CHBTC_ACCESS_KEY+'&currency='+market+'&pageIndex=1&pageSize=20';
            var _singData= _.signChbtc(params);
            console.log('singData='+_singData);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        },
        getOrder:function*(market,id){
            market = market + '_cny';
            var url =' https://trade.chbtc.com/api/getOrder?';
            var params= 'method=getOrder&accesskey='+C.CHBTC_ACCESS_KEY+'&id='+id+'&currency='+market;
            var _singData= _.signChbtc(params);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        },
        order:function*(type,market,amount,price){
            market = market + '_cny';
            var tradeType = (type ==='buy'?'1':'0');
            var url =' https://trade.chbtc.com/api/order?';
            var params= 'method=order&accesskey='+C.CHBTC_ACCESS_KEY+'&price='+price+'&amount='+amount+'&tradeType='+tradeType +'&currency='+ market;
            var _singData= _.signChbtc(params);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        },
        cancelOrder:function*(market,id){
            market = market + '_cny';
            var url =' https://trade.chbtc.com/api/cancelOrder?';
            var params= 'method=cancelOrder&accesskey='+C.CHBTC_ACCESS_KEY+'&id='+id+'&currency='+ market;
            var _singData= _.signChbtc(params);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        },
        getOrdersIgnoreTradeType:function*(market,pageIndex,pageSize){
            market = market + '_cny';
            var url =' https://trade.chbtc.com/api/getOrdersIgnoreTradeType?';
            var params= 'method=getOrdersIgnoreTradeType&accesskey='+C.CHBTC_ACCESS_KEY+'&currency='+market;
            params += '&pageIndex='+pageIndex+'&pageSize='+pageSize
            var _singData= _.signChbtc(params);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        },
        getOrdersNew:function*(market,pageIndex,pageSize){
            market = market + '_cny';
            var url =' https://trade.chbtc.com/api/getOrdersNew?';
            var params= 'method=getOrdersNew&accesskey='+C.CHBTC_ACCESS_KEY+'&tradeType=1&currency='+market;
            params += '&pageIndex='+pageIndex+'&pageSize='+pageSize
            var _singData= _.signChbtc(params);
            url = url + params +'&sign='+_singData+'&reqTime='+(new Date()).valueOf();
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
                return _.biz.outjson('-1', e, []);
            }
            var outData  = JSON.parse(result.body);
            console.log(outData);
            return market;
        }
    }
}