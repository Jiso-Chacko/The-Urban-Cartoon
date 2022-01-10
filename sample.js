// var a = "29,999.00"
// var b =  a.replace(',','')
// var c =  parseFloat(b)
// console.log(c);

// var dateFormat = require('dateformat');
// var now = new Date();
//  delivery = now.setDate(now.getDate() + 7);

// date = dateFormat(delivery, "dddd, mmmm dS, yyyy, h:MM:ss TT")
// console.log(date);

// var today = new Date().toISOString().split('T')[0]
// var tomorrow = today.setDate(today.getDate() + 1) 
// console.log(tomorrow);

// var date = new Date()

// // Add a day
// var newDate = date.setDate(date.getDate() + 1)
// console.log(newDate);

// let a = true
// let count = 0

// setTimeout(() => {
//     a = false
//     clearInterval(id)
// }, 2000)


// let id = setInterval(() => {
//     if(a){
//         console.log(count++);
//     }
// },200)

// reversing a string

// let reverseStr = (str) => {
//     let arr = []
//     arr = str.split('')
//     arr.reverse()
//     let reverseString = arr.join('')
//     console.log(reverseString)
// }

// reverseStr('chacko')

// (function revereseStr(str){
//     let reverse = ''
//     for(let character of str){
//         reverse = character + reverse
//     }
//     console.log(reverse);
// })('jiso!)

// const palindrome = (str) => {
//     let arr = str.split('').reverse().join('')
//     console.log(arr === str);
// }

// palindrome("aba")

// const maxChar = (str) => {
//     let obj = {}

//     for(let char of str){

//         if(!obj[char]){
//             obj[char] = 1
//         }
//         else{
//             obj[char]++
//         }
//     }
//     console.log(obj)

//     let maxCount = 0
//     let maxChar = ''

//     for(let char in obj){
//         if(obj[char] >= maxCount){
//             maxChar = char
//             maxCount = obj[char]
//         }
//     }
//     console.log(maxChar , maxCount);
// }

// maxChar('jjiso')

for(let i=1;i<50;i++){
    
    if(i%15 == 0){
        console.log('fizzbuzz');
    }else if(i%3 == 0){
        console.log('fizz');
    }else if(i%5 == 0){
        console.log('buzz');
    }else{

        console.log(i);
    }
}