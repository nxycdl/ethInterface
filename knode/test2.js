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
a = []
var underLine=[];

console.log(underLine);
var cnt = '';
var key1 = '';
console.log('xxx',underLine.length);
if (underLine.length >= 4){
    cnt = underLine[0] + underLine[1];
    key1 = underLine[2] + underLine[3];
}else if (underLine.length == 3){
    cnt = underLine[0] + underLine[1];
    key1 = underLine[2]
}else if(underLine.length == 2){
    console.log('xxx',key1);
    cnt = underLine[0] + underLine[1];
    key1 = '';
}else if(underLine.length == 1){
    cnt = underLine[0] ;
    key1 = '';
};
console.log(cnt)
console.log(key1)

