/**
 * Created by dl on 2017-05-25.
 */
const SECRET_KEY = C.CHBTC_SECRET_KEY;
var crypto = require('crypto');
var getTimeStamp = function () {
    return (new Date()).valueOf();
}
var _sign = function (args) {
    console.log('***********',args,SECRET_KEY)
    var _digest = (crypto.createHash('sha1').update(SECRET_KEY).digest('hex'));
    return (crypto.createHmac('md5', _digest).update(args).digest('hex'));
}

var sign = function (params) {
    var signData = _sign(params);
    return signData;
};

module.exports = sign;
