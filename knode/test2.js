/**
 * Created by dl on 2017-05-30.
 */
var moment = require('moment');
var data ={};
data.currentTime =      moment.unix('1501556733738').format('YYYY-MM-DD HH:mm:ss');
data.x1 =                 moment.unix('1501556734000').format('YYYY-MM-DD HH:mm:ss');
data.x2 =                 moment.unix('1501556734').format('YYYY-MM-DD HH:mm:ss');
var d = new Date();
console.log(d.getHours() + ':'+ d.getMinutes() + ':' +d.getSeconds());
var a=[1,2,3,4,5,6];
a.shift();
console.log(a);