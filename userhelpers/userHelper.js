var db = require('../config/connections')
var collection = require('../config/collections')
var ObjectID = require('mongodb').ObjectID
const {
    response
} = require('express')
var bcrypt = require('bcrypt')

module.exports = {

    doRegister: (newUser) => {
        console.log("This is doregister");
        console.log(newUser);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let password = newUser.confPassword
            let emailExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userEmail: newUser.email
            })
            let phoneExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone: newUser.phone
            })        

            if (emailExists == null && phoneExists == null) {
                let hashPass = await bcrypt.hash(password, 10)
                db.get().collection(collection.USER_COLLECTION).insertOne({
                    userFirstName: newUser.userFname,
                    userLastName: newUser.userLname,
                    userEmail: newUser.email,
                    userPhone: newUser.phone,
                    userPass: hashPass,
                    isEnabled: true
                }).then((result) => {
                    resolve(result.ops[0])  
                }).catch((err) => {
                    console.log(err);
                })
            }
            else if(emailExists && phoneExists){
                response.phoneExists = true,
                response.userExist = true,
                response.userEmailExist = true 
                resolve(response)
            }
            else if(emailExists){
                response.userExist = true,
                response.userEmailExist = true, 
                resolve(response)
            }
            else if(phoneExists){
                response.userExist = true,
                response.userPhoneExist = true
                resolve(response)
            }

        })
    },
    
    doLogin: (existUser) => {
    
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                userEmail : existUser.email
            })
            
            
           
            if(user == null){
                response.userExist = false,
                resolve(response)
            }
            else{
                console.log("Bcrypt response");
                  bcrypt.compare(existUser.password,user.userPass).then((result) => {
                    if(result){
                        console.log("This is dologin response");
                        console.log(user);
                        response.userExist = true,
                        response.user =  user
                        resolve(response)
                    }
                    else{
                        response.invalidPass = true,
                        response.userExist = false
                        resolve(response)
                    }
                    }).catch((err) => {
                        console.log(err);
                    })
               
            }
        })
    },

    getAllUsers : (checkUser) => {
        return new Promise(async (resolve,reject) => {
            let response ={}
            let emailExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userEmail: checkUser.email
            })
            let phoneExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone: checkUser.phone
            })
            if(emailExists || phoneExists){
            user = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone: checkUser.phone
            })
        }

            if (emailExists == null && phoneExists == null) {
                response.userExist = false               
                resolve(response)
            }
            else if(emailExists && phoneExists){
                response.userExist = true,
                response.user = user,
                resolve(response)
            }
            else if(emailExists){
                response.userExist = true,
                response.user = user
                resolve(response)
            }
            else if(phoneExists){
                response.userExist = true,
                response.user = user
                resolve(response)
            }
        })
    },

    getUserPhone :(body) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let phone = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone : body.phone
            })

            if(phone == null ){
                response.status = false
                resolve(response)
            }
            else{
                response.status = true
                response.phone = phone
                resolve(response)
            }
            
        })
    },

    addAddress : (address,userId,addressType) => {

        return new Promise(async (resolve,reject) => {
            let response = {}
            let addressCount = await db.get().collection(collection.ADDRESS_COLLECTION).find().toArray()
            console.log(addressCount.length);
            if(addressCount.length <= 3){
                db.get().collection(collection.ADDRESS_COLLECTION).insertOne({
                    userId : ObjectID(userId),
                    addressType : addressType,
                    address : address
                })
                response.status = true
                resolve(response)
            }
            else{
                response.status = false
                resolve(response)
            }            
        })
    },

    getAllAddress : (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({
                userId : ObjectID(userId)
            }).toArray()
            console.log(address);
            resolve(address)
        })
    }

}