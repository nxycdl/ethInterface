/**
 * Created by dl on 2017-08-02.
 * 网络爬虫;
 */
module.exports = function (self) {
    return {
        startRequestEthPool: function*() {
            var url = "http://pool.ethfans.org/miners/11ce67Dc936432a87153a9a3b6C1993Ac5Fe94CD";
            var result = {
                body: '[]'
            }
            try {
                result = yield M.request({
                    uri: url,
                    method: 'get'
                });
            } catch (e) {
                console.error(e);
                result = {
                    body: '[]'
                }
                return '';
            }
            //var $ = M.cheerio.load('<h2 class="title">Hello world</h2>'); //采用cheerio模块解析html
            var infoList = [];
            var $ = M.cheerio.load(result.body); //采用cheerio模块解析html
            var _table = $('tbody').text();
            if (_table =='') {
                console.log('无返回数据！');
                return _.biz.outjson('-1','网络异常','');
            }
            var data = _table.split('d');
            data.forEach(function (info, index) {
                //console.log(index, 'd' +info);
                if (index > 0) {
                    info = 'D' + info;
                    var line = info.split(' ');
                    //console.log(line);

                    var computer = {}
                    computer.name = line[0].substr(0, 3);
                    computer.currentData = line[0].substr(3, (line[0].length));
                    computer.time = (line[5].split(')')[1]) + '分钟';
                    computer.lasttime = (line[5].split(')')[1]);
                    if (computer.name != 'Def')
                        infoList.push(computer);
                }
            });
            return _.biz.outjson('0000','',infoList);
        }
    }
}