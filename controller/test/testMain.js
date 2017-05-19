/**
 * Created by dl on 2016-08-22.
 */
module.exports = {
    _extend: {

    },
    gotoMain:function*(){
        //http://127.0.0.1:9000/test/testMain/gotoMain
        options = new Object();
        this.body = yield this.render('404',{"options":options});
    }
}