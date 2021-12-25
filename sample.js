// var a = "29,999.00"
// var b =  a.replace(',','')
// var c =  parseFloat(b)
// console.log(c);

var dateFormat = require('dateformat');
var now = new Date();
 delivery = now.setDate(now.getDate() + 7);

date = dateFormat(delivery, "dddd, mmmm dS, yyyy, h:MM:ss TT")
console.log(date);