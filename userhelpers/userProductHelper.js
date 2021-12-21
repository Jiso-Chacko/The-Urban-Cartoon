var db = require('../config/connections')
var collection = require('../config/collections')
var ObjectID = require('mongodb').ObjectID
const {
    response
} = require('express')

module.exports = {

    getAllSlider: () => {
        return new Promise(async (resolve, reject) => {
            let slider = await db.get().collection(collection.SLIDER_COLLECTION).find().toArray()
            resolve(slider)
        })
    },

    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },

    getAllProducts: () => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    getAllFeatured: () => {
        return new Promise(async (resolve, reject) => {
            let featured = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                "proDetails.0.featured": "featured"
            }).toArray()
            resolve(featured)
        })
    },

    getAllTopRated: () => {
        return new Promise(async (resolve, reject) => {
            let topRated = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                "proDetails.0.topRated": "topRated"
            }).toArray()
            resolve(topRated)
        })
    },

    getAllOnsale: () => {
        return new Promise(async (resolve, reject) => {
            let onSale = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                "proDetails.0.onSale": "onSale"
            }).toArray()
            resolve(onSale)
        })
    },

    getAllLaptop: () => {
        return new Promise(async (resolve, reject) => {
            let laptop = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                category: "laptop"
            }).toArray()
            resolve(laptop)
        })
    },

    getAllSmartphone: () => {
        return new Promise(async (resolve, reject) => {
            let smartPhone = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                category: "smartphone"
            }).toArray()
            resolve(smartPhone)
        })
    },

    getProduct: (proId) => {
        return new Promise(async (resolve, reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).find({
                _id: ObjectID(proId)
            }).toArray()
            resolve(product)
        })
    },

    addToCart: (userId, proId) => {
        var proObj = {
            product: ObjectID(proId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: ObjectID(userId)
            })
            let UserProduct = await db.get().collection(collection.CART_COLLECTION).findOne({
                product: ObjectID(proId),
                user: ObjectID(userId)
            })

            if (UserProduct) {
                console.log("This is if case");
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: ObjectID(userId),
                    product: ObjectID(proId),
                }, {
                    $inc: {
                        quantity: 1
                    }
                }).then((result) => {
                    resolve(result)
                })
            } else {
                console.log("This is else case");
                let userProducts = await db.get().collection(collection.CART_COLLECTION).insertOne({
                    user: ObjectID(userId),
                    product: ObjectID(proId),
                    date: new Date(),
                    quantity: 1
                })
                //    console.log(userProducts)
            }
        })
    },

    getCartCount: (userId) => {
        console.log("This is getcart count");

        return new Promise(async (resolve, reject) => {
            let count = 0;
            let userproducts = await db.get().collection(collection.CART_COLLECTION).find({
                user: ObjectID(userId)
            }).toArray()
            console.log(userproducts);
            console.log(userproducts.length);
            if (userproducts) {
                count = userproducts.length
                resolve(count)
            } else {
                count = 0
                resolve(count)
            }
        })


    },

    getProductsForCart: (userId) => {

        return new Promise(async (resolve, reject) => {
            console.log("This is +++++");
            let products = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                    $match: {
                        user: ObjectID(userId)
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                }

            ]).toArray()

            // console.log("This is get Products for cart");
            // console.log(products);
            resolve(products)
        })
    },  

    changeQuantity: (body) => {

        console.log("This is changeQuantity");
        let userId = body.userId;
        let proId = body.proId;
        // let cartId = body.cartId;
        let count = body.count;
        console.log(count);

        return new Promise(async (resolve, reject) => {
            let response = {}
            if (count == 1) {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    user: ObjectID(userId),
                    product: ObjectID(proId),
                }, {
                    $inc: {
                        quantity: 1
                    }
                })
                response.status = true
                response.inc = true
                response.delete = false
                resolve(response)
            } else {
                let quantity = await db.get().collection(collection.CART_COLLECTION).findOne({
                    user: ObjectID(userId),
                    product: ObjectID(proId)
                }, {
                    quantity: 1
                })
                console.log(quantity.quantity);
                if (quantity.quantity == 1) {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({
                        user: ObjectID(userId),
                        product: ObjectID(proId)
                    })
                    response.status = false
                    response.inc = false
                    response.delete = true
                    resolve(response)

                } 
                else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user: ObjectID(userId),
                        product: ObjectID(proId)
                    }, {
                        $inc: {
                            quantity: -1
                        }
                    })
                    response.status = true
                    response.inc = false
                    response.delete = false
                    resolve(response)                   
                }
            }
        })

    },

    getTotalAmount: (body) => {

        let response = {}
        return new Promise(async (resolve, reject) => {

            let totalAmount = await db.get().collection(collection.CART_COLLECTION).aggregate([{
                    $match: {
                        user: ObjectID(body)
                    }
                }, {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'product',
                        foreignField: '_id',
                        as: 'productDetails'
                    }
                },
                {
                    $unwind: '$productDetails'
                },
                {
                    $project: {
                        quantity: 1,
                        "productDetails.price": 1
                    }
                },
            ]).toArray()
            let array = []
            for (i = 0; i < totalAmount.length; i++) {
                console.log(totalAmount[i].quantity);
                console.log(totalAmount[i].productDetails.price);
                array.push(totalAmount[i].quantity * totalAmount[i].productDetails.price)
            }
            let sum = 0
            for (i = 0; i < array.length; i++) {
                sum += array[i]
            }
            response.individualSum = array
            response.totalSum = sum
            resolve(response)
        })
    },

    deleteProductFromCart : (body) => {
        let userId =  body.userId
        let proId =  body.proId
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).deleteOne({
                user: ObjectID(userId),
                product: ObjectID(proId)
            })
            resolve(deleted = true)
        })
    },

    addToWishlist :  (userId,proId) => {

        return new Promise(async (resolve,reject) => {
            let response = {}
            let product = await db.get().collection(collection.WISHLIST_COLLECTION).findOne({
                userId : ObjectID(userId),
                proId : ObjectID(proId)
            })
            console.log("This is addtowishlist promise");
            console.log(product);
            if(product == null){
                db.get().collection(collection.WISHLIST_COLLECTION).insertOne({
                    userId : ObjectID(userId) ,
                    proId : ObjectID(proId)
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

    getProductsForWishlist : (userId) => {
        return new Promise(async (resolve,reject) => {
            let proId = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([
              {
                $match: {
                    userId: ObjectID(userId) 
                },
               
              },{
                  $project : {
                      proId : 1,
                      _id : 0
                  }
              }  
            ]).toArray()
         
            console.log(proId);

            let products = await db.get().collection(collection.WISHLIST_COLLECTION).aggregate([{
                $match: {
                    userId: ObjectID(userId) 
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'proId',
                    foreignField: '_id',
                    as: 'productDetails'
                }
            },
            {
                $unwind: '$productDetails'                                
            },{
                $project: {               
                    "productDetails.price": 1,
                    "productDetails.productName" : 1,
                    "productDetails.imageName" : 1,
                    "_id" : 1
                },
                
            }


        ]).toArray()
        console.log("this is getproducts for wihlist");
        let product = []
        for(i=0;i<products.length;i++){ 
           product.push(products[i].productDetails) 
        }
       for(i=0;i<product.length;i++){
           console.log(product[i]);
           product[i].proId = proId[i].proId
       }      
        console.log(product);
        resolve(product)
        })
        
    },

    deleteProductFromWishlist : (userId, proId) => {
        console.log("This is delete wishlist in database");
        return new Promise((resolve,reject) => {
            db.get().collection(collection.WISHLIST_COLLECTION).deleteOne({
                userId: ObjectID(userId),
                proId: ObjectID(proId)
                
            })
            console.log("Product deleted");
            resolve(deleted = true)
        })
    },

    placeOrder : (userId,order,products,totalAmount) => {
        return new Promise((resolve,reject) => {
        console.log("This is create order");
        console.log(userId);
        console.log(products);
        console.log(totalAmount);
        console.log(order);
        resolve(status = true)
        })
        
    }
}