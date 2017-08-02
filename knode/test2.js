/**
 * Created by dl on 2017-05-30.
 */
var CronJob = require('cron').CronJob;
var netPull = new CronJob(
    '0 */3 * * * *',
    // '*/5 * * * * *',
    function () {
        console.log('netPull',new Date())
    },
    false,
    "Asia/Shanghai"
);

var netPullEthOur = new CronJob(
    '0 0 6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23 * * * *',
    function () {
        console.log('netPullEthOur',new Date())
    },
    false,
    "Asia/Shanghai"
);

netPullEthOur.start();
netPull.start();



