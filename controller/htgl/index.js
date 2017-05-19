/**
 * Created by dl on 2016/4/2.
 */
/**
 *
 * @type {{_extend: {}, gotoMain: "主页"}}
 */
module.exports = {
    _extend: {
        htglService: require(C.service + 'htgl/htglService'),
        wxUtils: require(C.service + 'weixin/wxUtils')
    },
    get: function *() {
        var inData = this.query;
        this.body = {error: '1', message: 'get methods', data: inData};
    },
    post: function*() {
        var inData = this.request.body;
        this.body = {error: '1', message: 'post methods', data: inData};
    },
    home: function*() {
        this.body = yield this.render("home");
    }
}