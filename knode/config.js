/**
 * Author: ken.xu Date: 14-6-4 下午3:30
 * Modified by fd-lujj 15-5-5
 */
module.exports = function (root) {
    return {
        //系统目录
        view: root + '/view/',
        access: root + '/access/',
        controller: root + '/controller/',
        service: root + '/service/',
        //cookie session
        maxAge: 259200000,
        secret: '*&$^*&(*&$%@#@#$@!#$@%((()*()^#$%$#%@#$%@#$%$#',
        //端口设置
        port: 7002,
        //mysql设置
        mysql: {
            host: '120.26.109.153',
            port: '3306',
            database: 'btc',
            user: 'btc',
            password: 'btc99999',
            waitForConnections: true,
            connectionLimit: 20,
            supportBigNumbers: true,
            dateStrings: 'yyyy-MM-dd HH:mm:ss'
        },
        postUrl: "http://www.ihealthyun.com:3343",
        appId: "wx96339f6e3e393d60",
        appSecret: "4536a35ce5418d49a7ecd300b01e98e4",
        expireTime: 7200,
        weixinCacheToken: root + '/cacheFile/weixinCacheToken.json',
        weixinJsApi_ticket: root + '/cacheFile/weixinJsApi_ticket.json',
        YUNBI_ACCESS_KEY: '5cxGSB4trxruisrlfpZxlmKwkDMRfAne9xDEe5JJ',
        YUNBI_SECRET_KEY: 'xhmWD1Lr15FYFtrEqGO24lTv7D9KI0S2pXXkhCxO',
        alismsaccessKeyId: 'LTAIzzAzb8GLyeCk',
        alismssecretAccessKey: 'QK3ZIFWNNQ0bX8ZFUFAzkvQ11XugFU',
        isaliSms: true,
        CHBTC_SECRET_KEY: '4b41f9b5-5a1a-4f52-bf3a-147cad90350b',
        CHBTC_ACCESS_KEY: '879042e6-52ef-4e60-8408-6ab918ba32e1'
    }

}