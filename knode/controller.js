module.exports = function (app, fs) {

    var router = app.use(require('koa-router')(app));
    var default_index = C.default_index;
    var compose = require('koa-compose');
    var controllers = [];

    /**
     * 注入 init 函数
     * @param fn 原有方法
     * @param ctrl 全局方法 目前只支持 _init
     * @returns {*}
     * 增加其他全局 增加 执行数组 队列执行 ctrl.access [fn,fn] 根据由左到右执行
     */
    var _construct = function (fn, ctrl, controller, action) {
        var load_func = []

        load_func.push(function *(next) {

            this.controller_name = controller
            this.action_name = action
            yield next
        })

        if (_.isArray(ctrl._access)) {
            _.forEach(ctrl._access, function (v, k) {
                var rs_func = _translate_access(v)
                load_func.push(rs_func)
            })
        }

        var _extend_common_cache = {}
        load_func.push(function *(next) {

            for (var i in ctrl._extend) {
                if (!_extend_common_cache[i]) {
                    _.extend(_extend_common_cache, ctrl._extend[i](this, i))
                }
                this[i] = _extend_common_cache
            }
            yield next
        })

        load_func.push(fn)
        return compose(load_func)
    }

    var _translate_access = function (name) {
        name = name.split('/')
        var func = require(C.access + name[0])[name[1]] || function*(next) {
                yield next
            };
        return func;
    }

    var _iteratorDir = function (path) {
        var full_path = C.controller + path;
        fs.readdirSync(full_path).forEach(function (name) {
            if (name.indexOf('.js') > -1) {
                if (_.startsWith(path + name, '/')) {
                    controllers.push(path.substr(1) + name);
                } else {
                    controllers.push(path + name);
                }
            } else if (fs.statSync(full_path + name).isDirectory()) {
                _iteratorDir(path + name + '/');
            }
        });
        return;
    };

    //***************注册深层Controller
    _iteratorDir('');
    _.forEach(controllers, function (eachone) {
        var ctrl = require(C.controller + eachone)
        eachone = eachone.replace('.js', '').toLowerCase();
        _.forEach(ctrl, function (v, k) {
            if (_.isFunction(v)) {
                var route_name = '/' + eachone + '/' + k;
                if (C.default_controller == eachone && C.default_action == k) {
                    router.all('/', _construct(v, ctrl, eachone, k))
                }
                router.all(route_name, _construct(v, ctrl, eachone, k))
            }
        })
    });

}