var mysqldb = require('mysql');

module.exports = function (options) {
    //ConnectionConfig = require(root + '/pool/config.js')

    return new Pool(options);
};

function Pool(options) {

    this.config = options;
    this.config.waitForConnections = (options.waitForConnections === undefined) ? true : Boolean(options.waitForConnections);
    this.config.connectionLimit = (options.connectionLimit === undefined) ? 10 : Number(options.connectionLimit);
    this.config.queueLimit = (options.queueLimit === undefined) ? 0 : Number(options.queueLimit);

    this._allConnections = [];
    this._freeConnections = [];
    this._closed = false;
}

Pool.prototype.createConnection = function () {

    var connection = mysqldb.createConnection(this.config);

    this._allConnections.push(connection);

    return connection;
};

Pool.prototype.getConnection = function (cb) {
    if (this._closed)
        throw new Error('Pool is closed.');

    var connection;

    if (this._freeConnections.length > 0) {
        connection = this._freeConnections.shift();
    } else if (this.config.connectionLimit === 0 || this._allConnections.length < this.config.connectionLimit) {
        connection = this.createConnection();
    } else {
        // 对于当前没有空闲的连接时，随便返回一个非空闲的connection去处理sql请求
        var n = Math.floo(Math.random() * this._allConnections.length + 1) - 1;
        connection = this._allConnections[n];
    }

    var allConnections = this._allConnections;
    var freeConnections = this._freeConnections;

    connection.once('error', function (err) {
        // 如果是连接断开，自动重新连接
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {

            // 从总连接池和空闲连接池中移除已断开的链接
            for (var i = 0; i < allConnections.length; i++) {
                if (allConnections[i] === connection) {
                    allConnections.remove(i);
                    break;
                }
            }
            for (var i = 0; i < freeConnections.length; i++) {
                if (freeConnections[i] === connection) {
                    freeConnections.remove(i);
                    break;
                }
            }

            connection.end();
        } else {
            throw err;
        }
    });

    return connection;
};

Pool.prototype.releaseConnection = function (connection) {
    //     var cb;
    //
    //     if (!connection._pool) {
    //         // The connection has been removed from the pool and is no longer good.
    //         if (this._connectionQueue.length) {
    //             cb = this._connectionQueue.shift();
    //
    //             process.nextTick(this.getConnection.bind(this, cb));
    //         }
    //     } else if (this._connectionQueue.length) {
    //         cb = this._connectionQueue.shift();
    //
    //         process.nextTick(cb.bind(null, null, connection));
    //     } else {
    //         console.log('*********');
    //         this._freeConnections.push(connection);
    //     }
    //connection.end();
    this._freeConnections.push(connection);
};