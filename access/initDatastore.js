/**
 * Created by yanhu on 14-10-17.
 */
module.exports = function () {
    return {
        initialize: function () {

            // 将参数表中的数据缓存下来
            var paramArr = new _.hashmap();
            //M.dbAsyn.queryAsyn('select param_name,param_value from sys_params',
            //    function (err, results) {
            //        for (var i = 0; i < results.length; i++) {
            //            paramArr.put(results[i].param_name, results[i].param_value);
            //        }
            //        C.CacheData.put('PARAM', paramArr);
            //    });
        }
    }
}