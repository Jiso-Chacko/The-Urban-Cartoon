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
            } else if (emailExists && phoneExists) {
                response.phoneExists = true,
                    response.userExist = true,
                    response.userEmailExist = true
                resolve(response)
            } else if (emailExists) {
                response.userExist = true,
                    response.userEmailExist = true,
                    resolve(response)
            } else if (phoneExists) {
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
                userEmail: existUser.email
            })



            if (user == null) {
                response.userExist = false,
                    resolve(response)
            } else {
                console.log("Bcrypt response");
                bcrypt.compare(existUser.password, user.userPass).then((result) => {
                    if (result) {
                        console.log("This is dologin response");
                        console.log(user);
                        response.userExist = true,
                            response.user = user
                        resolve(response)
                    } else {
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

    getAllUsers: (checkUser) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let emailExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userEmail: checkUser.email
            })
            let phoneExists = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone: checkUser.phone
            })
            if (emailExists || phoneExists) {
                user = await db.get().collection(collection.USER_COLLECTION).findOne({
                    userPhone: checkUser.phone
                })
            }

            if (emailExists == null && phoneExists == null) {
                response.userExist = false
                resolve(response)
            } else if (emailExists && phoneExists) {
                response.userExist = true,
                    response.user = user,
                    resolve(response)
            } else if (emailExists) {
                response.userExist = true,
                    response.user = user
                resolve(response)
            } else if (phoneExists) {
                response.userExist = true,
                    response.user = user
                resolve(response)
            }
        })
    },

    getUserPhone: (body) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let phone = await db.get().collection(collection.USER_COLLECTION).findOne({
                userPhone: body.phone
            })

            if (phone == null) {
                response.status = false
                resolve(response)
            } else {
                response.status = true
                response.phone = phone
                resolve(response)
            }

        })
    },

    addAddress: (address, userId, addressType) => {

        return new Promise(async (resolve, reject) => {
            console.log("Address added");
            let response = {}
            // let addressCount = await db.get().collection(collection.ADDRESS_COLLECTION).find().toArray()
         
                db.get().collection(collection.ADDRESS_COLLECTION).insertOne({
                    userId: ObjectID(userId),
                    addressType: addressType,
                    address: address
                })
                response.status = true
                resolve(response)
            
        })
    },

    getAllAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.ADDRESS_COLLECTION).find({
                userId: ObjectID(userId)
            }).toArray()

            console.log("This is addess array :" + address.length);
            console.log(address);
            if (address.length == 0) {
                resolve({
                    status: false,
                    address: null
                })
            } else {
                resolve({
                    status: true,
                    address: address
                })
            }
        })
    },

    getUsersForAdmin: () => {
        return new Promise(async (resolve, reject) => {

            let users = await db.get().collection(collection.USER_COLLECTION).find({}).toArray()
            console.log(users);
            resolve(users)
        })
    },

    getHomeAddress: (value, userId) => {

        return new Promise(async (resolve, reject) => {
            let homeAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({
                userId: ObjectID(userId),
                addressType: value
            })
            resolve(homeAddress)
        })
    },

    getOfficeAddress: (value, userId) => {

        return new Promise(async (resolve, reject) => {
            let officeAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({
                userId: ObjectID(userId),
                addressType: value
            })
            resolve(officeAddress)
        })
    },

    getAllAddressType: (userId) => {
        return new Promise(async (resolve, reject) => {

            let addressType = await db.get().collection(collection.ADDRESS_COLLECTION).aggregate([{
                $match: {
                    userId: ObjectID(userId)
                }
            }, {
                $project: {
                    addressType: 1,
                    _id: 0
                }
            }]).toArray()
            console.log("***********");
            console.log(addressType);
            resolve(addressType)
        })
    },

    getOtherAddress: (value, userId) => {
        return new Promise(async (resolve, reject) => {
            let otherAddress = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({
                userId: ObjectID(userId),
                addressType: value
            })
            resolve(otherAddress)
        })
    },

    editProfile : (body,image,userId) => {

        return new Promise((resolve,reject)  => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id : ObjectID(userId)
            },
            {
               $set : {
                userFirstName : body.firstName,
                userLastName : body.lastName,
                userEmail : body.email,
                image : image
               }
            })
            resolve()
        })
    },

    getUser : (userId) => {
       return new Promise(async (resolve,reject) => {

           let user = await db.get().collection(collection.USER_COLLECTION).findOne({
               _id : ObjectID(userId)
           })
         resolve(user)
       }) 
    },

    getImage : (userId) => {

        return new Promise(async (resolve,reject) => {
         let image =await db.get().collection(collection.USER_COLLECTION).aggregate([
                {
                    $match : {
                       _id : ObjectID(userId)
                    }
                },
                {
                    $project : {
                        image : 1,
                        _id : 0
                    }
                }
            ]).toArray()
            console.log("//////");
            console.log(image[0].image);
            resolve(image[0].image)
        })
    },

    changePass : (userId,body) => {

        return new Promise(async (resolve,reject) => {

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id : ObjectID(userId)
            }) 
            console.log(user.userPass);
            bcrypt.compare(body.pass1,user.userPass).then(async (result) => {
                console.log("pass cmpr");
                console.log(result);
                if(result == true){
                    let hashPass =  await bcrypt.hash(body.newPass,10)
                    db.get().collection(collection.USER_COLLECTION).updateOne({
                        _id : ObjectID(userId)
                    },{
                        $set : {
                            userPass : hashPass
                        }
                    })
                    resolve({status : true})
                }
                else{
                    resolve({status : false})
                }
            })          
        })
    },

    getAddress : (userId,type) => {

        return new Promise(async(resolve,reject) => {

            let address = await db.get().collection(collection.ADDRESS_COLLECTION).findOne({
                userId : ObjectID(userId),
                addressType : type
            })
            // console.log("++++++");
            // console.log(address);
            resolve(address)
        })
    },

    editAddress : (userId,address) => {

        return new Promise((resolve,reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).updateOne({
                userId : ObjectID(userId)
            },
            {
                $set : {
                    address : address
                }
            })
            resolve()
        })
    },

    deleteAddress : (userId,type) => {

        return new Promise((resolve,reject) => {
            db.get().collection(collection.ADDRESS_COLLECTION).deleteOne({
                userId : ObjectID(userId),
                addressType : type
            })
            resolve()
        })
    },

    blockUser : (userId) => {

        return new Promise((resolve,reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id : ObjectID(userId)
            },
            {
                $set : {
                    isEnabled : false
                }
            })
            resolve(block =  true)
        })
    },

    unblockUser : (userId) => {

        return new Promise((resolve,reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id : ObjectID(userId)
            },
            {
                $set : {
                    isEnabled : true
                }
            })
            resolve(unblock =  true)
        })
    }

}