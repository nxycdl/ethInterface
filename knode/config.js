/**
 * Author: ken.xu Date: 14-6-4 下午3:30
 * Modified by fd-lujj 15-5-5
 */
module.exports=function(root){
    return {
        //系统目录
        view:root+'/view/',
        access:root+'/access/',
        controller:root+'/controller/',
        service: root + '/service/',
        //cookie session
        maxAge: 259200000,
        secret:'*&$^*&(*&$%@#@#$@!#$@%((()*()^#$%$#%@#$%@#$%$#',
        //端口设置
        port:9000,
        //mysql设置
       mysql:{

            waitForConnections: true,
            connectionLimit: 20,
            supportBigNumbers: true,
            dateStrings: 'yyyy-MM-dd HH:mm:ss'
        },
        postUrl:"http://www.ihealthyun.com:3343",
        appId:"wx96339f6e3e393d60",
        appSecret:"4536a35ce5418d49a7ecd300b01e98e4",
        expireTime:7200,
        weixinCacheToken:root+'/cacheFile/weixinCacheToken.json',
        weixinJsApi_ticket:root+'/cacheFile/weixinJsApi_ticket.json'
    }

}