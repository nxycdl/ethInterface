/**
 * Created by dl on 2017-07-31.
 */
module.exports = {
    outjson: function (code, err, data) {
        var bizData = {};
        var outdata = [];
        if (!_.isUndefined(data)){
            outdata.push(data);
        }
        bizData.code = code;
        bizData.data = data;
        if (_.isUndefined(err))
            bizData.err = "";
        else
            bizData.err = err;

        return bizData;
    }
}