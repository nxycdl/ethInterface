/**
 * Created by Administrator on 2017-08-13.
 */
module.exports = function (self) {
    return {
        queryUnComplete: function*(db) {
            //查询所有正在进行用的订单
            var sql = "select * from orderhead where status = '1' and orderstatus <> '9'";
            var data = yield db.query(sql);
            return data[0];
        },
        executeSqlx: function *(db, sql,params) {
            var data = yield db.query(sql,params);
            return data[0];
        }

    }
}