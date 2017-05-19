/**
 * Created by fd-lujj on 15-5-5.
 */
var ref = function(self){
    return self.request.header.referer || '/';
}

module.exports = {

    init:function * (next){
        //这个是用来控制权限的
        var roleright = C.CacheData.get('ROLE').get('管理员');
        //console.log(roleright)
        yield next;
    }
}