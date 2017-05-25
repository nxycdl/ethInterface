/**
 * Created by dl on 2017-05-25.
 */
const ACCESS_KEY = C.YUNBI_ACCESS_KEY;
const SECRET_KEY = C.YUNBI_SECRET_KEY;
var crypto = require('crypto');
var getTimeStamp = function () {
    return (new Date()).valueOf();
}
var raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });

    var string = '';
    for (var k in newArgs) {
        string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
};

var _sign = function (args) {
    return (crypto.createHmac('SHA256', SECRET_KEY).update(args).digest('hex'));
}

var sign = function (canonical_verb, canonical_uri, params) {
    params.tonce = getTimeStamp();
    params.access_key = ACCESS_KEY;
    var canonical_query = raw(params);

    var payload = canonical_verb + '|' + canonical_uri + '|' + canonical_query;
    //console.log(payload);
    var signData = _sign(payload);
    params.signature = signData;
    return params;
};

module.exports = sign;
