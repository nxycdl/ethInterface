/**
 * Created by ken.xu on 14-2-10.
 *
 */
/**
 *
 * @param root 根目录
 * @param kpath 库目录
 */
module.exports = function (root, kpath) {

    /**
     * ===================自定义部分=====================
     * C全局静态配置
     * M全局外部模块调用
     * G全局动态变量
     * _全局公共函数
     */

    global.C = {};
    global.M = {};
    global.G = {};
    global._ = require('lodash');

    //================主模块=========================
    var koa = require('koa'),
        staticCache = require('koa-static-cache'),
        cors = require('koa-cors'),
        swig = require('swig'),
        app = koa(),
        path = require('path'),
        fs = require('fs'),
        qr = require('qr-image'),
        request = require('co-request'),
        co = require('co'),
        bodyParser = require('koa-bodyparser'),
        parseString = require('xml2js').parseString,
        thunkify = require('thunkify'),
        querystring = require('querystring'),
        formidable = require('formidable'),
        XMLWriter = require('xml-writer'),
        url = require('url'),
        combo = require('koa-combo'),
        moment = require('moment'),
        cheerio = require('cheerio');

    // 声明成公共
    M.qr = qr;
    M.request = request;
    M.parseString = parseString;
    M.thunkify = thunkify;
    M.querystring = querystring;
    M.fs = fs;
    M.formidable = formidable;
    M.path = path;
    M.root = root;
    M.XMLWriter = XMLWriter;
    M.url = url;
    M.moment = moment;
    M.cheerio = cheerio;

    //===================获取配置内容
    var systemConfig = require(kpath + '/config')(root);
    C = systemConfig;

    //==================获取自定义配置内容:
    C.myConfig = require(kpath + '/MyConfig')(root);

    //===================缓存配置
    C.debug = {};
    C.debug.common = false; //全局debug
    C.debug.logger = true; //请求debug
    C.debug.db = true; //数据库debug

    //===================debug module
    if (C.debug.common || C.debug.logger) {
        var logger = require('koa-logger');
        app.use(logger());
    }

    //===================定义模版类型以及路径
    require('koa-swig')(app, {
        root: C.view,
        autoescape: true,
        //cache: 'memory', // disable, set to false
        ext: 'html'
        //locals: locals,
        //filters: filters,
        //tags: tags,
        //extensions: extensions
    });

    app.use(cors());

    //post 处理 this.request.body;
    app.use(bodyParser());

    //静态文件库
    var static_root = path.join(root, 'static');
    app.use(staticCache(static_root, {
        maxAge: 860000000,
        gzip: true
    }));

    //加载静态文件库
    app.use(combo([static_root]));

    //公共函数定义 合并 lodash
    var styleFn = require(kpath + '/init')(kpath);
    _.extend(_, styleFn);

    var mysql = require('mysql');
    // 连接数据库（处理正常业务，同步操作）
    M.pool = require(kpath + '/pool/pool')(C.mysql);
    //M.pool = mysql.createPool(C.mysql);

    // 连接数据库，异步操作
    //M.dbAsyn = mysql.createConnection(C.mysql);

    // 用soap方式调webservise地址
    var soap = require('soap');
    M.soap = soap;

    //密钥
    app.keys = [C.secret];

    //favicon 特殊处理
    app.use(function *(next) {
        //非favicon 直接跳过
        if ('/favicon.ico' != this.path) return yield next;
        //头部定义防止 404
        if ('GET' !== this.method && 'HEAD' !== this.method) {
            this.status = 'OPTIONS' == this.method ? 200 : 405;
            this.set('Allow', 'GET, HEAD, OPTIONS');

            return;
        }
    });

    require(kpath + 'controller')(app, fs);

    // 调用异步方法将需要初始化的数据加载进来
    C.CacheData = new _.hashmap();// 存储服务器启动的时候需要初始化的数据
    var datastore = require(C.access + '/initDatastore.js')();
    datastore.initialize();

    //var koaio = require('koa.io');

    /*
     var socketio = koaio();

     // middleware for scoket.io's connect and disconnect
     socketio.io.use(function* (next) {
     // on connect
     yield* next;
     // on disconnect
     });

     var socketMap = new _.hashmap();
     M.socketMap = socketMap;
     // 建立socket连接
     socketio.io.route('join', function* (next, data) {

     socketMap.put(data.device_code, this);

     this.emit('join', {
     status: '200'
     });
     });

     socketio.listen(3000);
     */

    var CronJob = require('cron').CronJob;
    var cronService = require(C.service + "cron/cronService");


    var jobid = new CronJob(
        //每天08点02分发送一次;
        '*/10 * * * * *',
        function () {
             // co(cronService.autoBuss());
             // co(cronService.checBuss());
        },
        false,
        "Asia/Shanghai"
    );
    var jobid2 = new CronJob(
        //每天12点08分发送一次;
        //'0 10 21 * * *',
        '*/5 * * * * *',
        function () {
            //co(cronService.getTickers('sccny'));
            /*co(cronService.getAllTickers('YUNBI', 'btc'))
             co(cronService.getAllTickers('OKCOIN', 'btc'))
             co(cronService.getAllTickers('CHBTC', 'btc'))
             co(cronService.getAllTickers('HUOBI', 'btc'))*/

        },
        false,
        "Asia/Shanghai"
    );

    var jobOnce = new CronJob(
        //每天12点08分发送一次;
        //'0 10 21 * * *',
        '*/5 * * * * *',
        function () {
            // co(cronService.insertDoneOrder());
        },
        false,
        "Asia/Shanghai"
    );

    //网络爬虫;
    var netPull = new CronJob(
         '0 */3 * * * *',
        // '*/5 * * * * *',
        function () {
            co(cronService.startRequestEthPool());
        },
        false,
        "Asia/Shanghai"
    );

    var netPullEthOur = new CronJob(
        '0 0 0/1 * * * * ',
        function () {
            co(cronService.startRequestEthPoolHour());
        },
        false,
        "Asia/Shanghai"
    );

    var netPullYunBi = new CronJob(
        '*/5 * * * * *',
        function () {
            //co(cronService.startRequestYunBiKLine());
        },
        false,
        "Asia/Shanghai"
    );
    var autoListenerOrder = new CronJob(
        '*/5 * * * * *',
        function () {
            co(cronService.autoListenerOrder());
        },
        false,
        "Asia/Shanghai"
    );

    var saveAllYunBiTicketCron = new CronJob(
        '*/2 * * * * *',
        function () {
            co(cronService.saveAllYunBiTicket());
        },
        false,
        "Asia/Shanghai"
    );
    // chBTC自动交易;
    var autoListenerChbtcOrder = new CronJob(
        '*/2 * * * * *',
        function () {
            co(cronService.autoListenerMyChbtcOrder());
        },
        false,
        "Asia/Shanghai"
    );


    jobid.start();
    jobid2.start();
    jobOnce.start();
    netPull.start();
    netPullEthOur.start();
    netPullYunBi.start();
    autoListenerOrder.start();
    saveAllYunBiTicketCron.start();
    autoListenerChbtcOrder.start();

    setTimeout(function () {
        jobOnce.stop();
    }, 6000)

    //404页面
    app.use(function * pageNotFound(next) {
        this.body = yield this.render('404');
    });

    /**
     * 监听端口
     */
    app.listen(C.port);
    console.log('listening on port ' + C.port);

    /**
     * 错误处理
     */
    app.on('error', function (err) {
        console.log('server error', err);
    });

};
