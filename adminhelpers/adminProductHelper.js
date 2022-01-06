var db = require('../config/connections')
var collection = require('../config/collections')
var ObjectID = require('mongodb').ObjectID
const { response } = require('express')
const { PRODUCT_COLLECTION, SLIDER_COLLECTION, BANNER_COLLECTION } = require('../config/collections')


module.exports = {

    addProduct : (product,images,callback) =>{
        let price = product.price;
        let removeComma = price.replace(',','')
        let newPrice = parseFloat(removeComma)
        let checkBox = [product.featured, product.onSale,product.topRated]
        db.get().collection('product').insertOne({
            productName : product.productName,
            productTitle : product.productTitle,
            description : product.description,
            checkBox : checkBox,
            price : newPrice,  
            quantity : parseInt(product.quantity),
            category : product.category,
            brand : product.brand,
            imageName : images,
            proDetails : [product]
        }).then((data) =>{
            // console.log(data);
            callback(data.ops[0])
        }).catch((err) => {
            console.log(err);
        })       
    },

    getallProducts : () =>{
        return new Promise(async (resolve,reject) => {
            let products = await db.get().collection(PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

    addNewSlider : (body,image) => {
        
        db.get().collection(SLIDER_COLLECTION).insertOne({
            sliderTitle : body.slider,
            sliderTagline : body.tagline,
            sliderImage : image
        }).then((data) => {
        }).catch((err) => {
            console.log(err);
        })
    },

    getAllSlider : () => {
        return new Promise(async (resolve, reject) => {
            let slider = await db.get().collection(SLIDER_COLLECTION).find().toArray()
            resolve(slider)
        })
    },

    addNewBanner : (body,image) => {
        
        db.get().collection(BANNER_COLLECTION).insertOne({
            bannerTitle : body.banner,
            bannerTagline : body.tagline,
            bannerImage : image
        }).then((data) => {
        }).catch((err) => {
            console.log(err);
        })
    },

    getAllBanner : () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },

    addCategory : (body) => {
        console.log("Entered addCategory");
        console.log(body);
        categoryName =  body.categoryName;
        let response = {}
        return new Promise(async (resolve,reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).findOne({categoryName : categoryName})
            if(category == null){
                console.log("This is new category");
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne({
                    categoryName : categoryName,
                    brand : [body.brand]
                }).then((data) => {
                    response.data = data,
                    response.addNewCollection = true
                    response.status = true
                    resolve(response)
                }).catch((err) =>{
                    console.log(err);
                })
            }
            else if(categoryName == category.categoryName && !category.brand.includes(body.brand)){

                console.log("This is adding new brand");
              db.get().collection(collection.CATEGORY_COLLECTION).updateOne({
                    categoryName : categoryName
                },
                {
                    $push:{
                        brand : body.brand
                    }
                }
                ).then((data) => {
                    response.data = data,
                    response.addbrand = true,
                    response.status = true
                    resolve(response)
                }).catch((err) => {
                    console.log(err);
                })
            }
            else if(categoryName == category.categoryName && category.brand.includes(body.brand)){
                console.log("This is same categoey and same brand");
                response.sameBrand = true,
                response.status = false
                resolve(response)
            }
        })      
    },

    getAllCategory : () => {
        return new Promise( async(resolve,reject) => {
    
          let categoryFind =  await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(categoryFind)
        })
    },
    getCategoryByName : (categoryName) => {
        return new Promise( async(resolve,reject) => {
    
          let categoryFind =  await db.get().collection(collection.CATEGORY_COLLECTION).findOne({
              categoryName : categoryName
          })
            resolve(categoryFind)
        })
    },


    deleteProduct : (proId) => {
        return new Promise((resolve, reject) => {
            let response = {}
            db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({
                _id : ObjectID(proId)
            }).then((result) => {
                console.log(result);
                console.log("This is deleteProduct");
                response.status = true              
                resolve(response)
            })
            
        })
    },

    getAllBrands : () => {
        return new Promise(async (resolve,reject) => {

           let brands = await db.get().collection(collection.CATEGORY_COLLECTION).find({}).toArray()
           let brand = {}
        //    for(i=0;i<brands.length;i++){
        //     brand.categoryName = brands[i].categoryName
        //     brand.brand = brands[i].brand
        
        //    }
        //    console.log(brand);
            resolve(brands)
        })
    },

    getAllOrders : () => {

        return new Promise(async (resolve, reject) => {
           let orders = await db.get().collection(collection.ORDER_COLLECTION).find({}).toArray()
        //    console.log(orders);
           resolve(orders)
        })
    },

    changeOrderStatus : (body) => {
        console.log("This is change order status");
        return new Promise((resolve,reject) => {
            console.log(body.value);
            if(body.value === 'delivered'){
                console.log("Order delievered");   
                db.get().collection(collection.ORDER_COLLECTION).updateOne({
                    _id : ObjectID(body.orderId)
                },
                {
                    $set: {
                         "products.$[element].status" : "delivered" ,
                         "products.$[element].placed" : false ,
                         "products.$[element].shipped" : false ,
                         "products.$[element].delivered" : true ,
                         "products.$[element].cancelled" : false
                        }
                },
                { 
                    arrayFilters: [ { "element.product": { $eq: ObjectID(body.proId) } } ] 
                }) 
            }
            else if(body.value === 'shipped'){
                console.log("order shipped");
                db.get().collection(collection.ORDER_COLLECTION).updateOne({
                    _id : ObjectID(body.orderId)
                },
                {
                    $set: {
                         "products.$[element].status" : "Shipped" ,
                         "products.$[element].placed" : false ,
                         "products.$[element].shipped" : true ,
                         "products.$[element].delivered" : false,
                         "products.$[element].cancelled" : false
                        }
                },
                { 
                    arrayFilters: [ { "element.product": { $eq: ObjectID(body.proId) } } ] 
                })
            }
            else if(body.value === 'cancelled'){
                db.get().collection(collection.ORDER_COLLECTION).updateOne({
                    _id : ObjectID(body.orderId)
                },
                {
                    $set: {
                         "products.$[element].status" : "cancelled" ,
                         "products.$[element].placed" : false ,
                         "products.$[element].shipped" : false ,
                         "products.$[element].delivered" : false ,
                         "products.$[element].cancelled" : true
                        }
                },
                { 
                    arrayFilters: [ { "element.product": { $eq: ObjectID(body.proId) } } ] 
                })
            }
            resolve()
        })
    },
    
    getProduct : (proId) => {
        return new Promise(async (resolve,reject) => {
            let product = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({
                _id : ObjectID(proId) 
            })
            console.log("This is getproduct")
            // console.log(product);
            resolve(product)
        })
    },

    getImages : (proId) => {
        return new Promise(async (resolve,reject) => {
            let images = await db.get().collection(collection.PRODUCT_COLLECTION).findOne({
                _id : ObjectID(proId)
            })
            console.log("*****");
            console.log(images.imageName);
            resolve(images.imageName)
        })
    },

    updateProduct : (proId,body,images) => {
        console.log("This is update product")
        console.log(proId,body,images);

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id : ObjectID(proId)
        },{
            $set : {
                productName : body.productName,
                description : body.description,
                price : parseInt(body.price) ,
                quantity : body.quantity,
                brand : body.brand,
                category : body.category,
                imageName : images
            }
        })
    },

    updateProductimg2 : (proId,body,image) => {

        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id : ObjectID(proId)
        },{
            $set : {
                productName : body.productName,
                description : body.description,
                price : parseInt(body.price) ,
                quantity : body.quantity,
                brand : body.brand,
                category : body.category,
                "imageName.1" : image
            }
        })

    },

    updateProductimg1 : (proId,body,image) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id : ObjectID(proId)
        },{
            $set : {
                productName : body.productName,
                description : body.description,
                price : parseInt(body.price) ,
                quantity : body.quantity,
                brand : body.brand,
                category : body.category,
                "imageName.0" : image
            }
        })
    },

    updateProductimg3 : (proId,body,image) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id : ObjectID(proId)
        },{
            $set : {
                productName : body.productName,
                description : body.description,
                price : parseInt(body.price) ,
                quantity : body.quantity,
                brand : body.brand,
                category : body.category,
                "imageName.2" : image
            }
        })
    },

    updateProductimg4 : (proId,body,image) => {
        db.get().collection(collection.PRODUCT_COLLECTION).updateOne({
            _id : ObjectID(proId)
        },{
            $set : {
                productName : body.productName,
                description : body.description,
                price : parseInt(body.price),
                quantity : body.quantity,
                brand : body.brand,
                category : body.category,
                "imageName.3" : image
            }
        })
    },

    createCoupon : (coupon) => {
        return new Promise(async (resolve,reject) => {
            
            let getCoupon = await db.get().collection(collection.COUPON_COLLECTION).findOne({
                name : coupon.couponName
            })
            console.log(getCoupon)
            if(getCoupon == null){
                db.get().collection(collection.COUPON_COLLECTION).insertOne({
                    name : coupon.couponName,
                    code : coupon.couponCode,
                    offer : parseInt(coupon.offerPercentage),
                    validity : coupon.couponValidity
                })
                resolve(created = true)
            }
            else{
                resolve(created = false)
            }
        })
    },

    getAllCoupen : () => {
        return new Promise(async (resolve,reject)  => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },

    deleteCoupon : (couponId) => {
        return new Promise((resolve,reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({
                _id : ObjectID(couponId)
            })
            resolve()
        })
    },

    getAllBrandsForOffers: () => {
        return new Promise(async (resolve,reject) => {
            let brands = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                {
                    $project : {
                        brand : 1
                    }
                },
                {
                    $unwind : '$brand'
                },
                {
                    $group : {
                        _id : '$brand', 
                    }
                }
            ]).toArray()

            resolve(brands)   
        })
    },

    createBrandOffer: (body) => {

        return new Promise( async (resolve,reject) => {

            let brandExist = await db.get().collection(collection.OFFER_COLLECTION).findOne({
                brand : body.brand
            })

            if(brandExist == null){
                db.get().collection(collection.OFFER_COLLECTION).insertOne({
                    brand : body.brand,
                    offer : parseInt(body.offerPercentage),
                    validity : body.validity,
                    offerFor : body.brand,
                    offerTitle : 'brand'
                })
                console.log("///////")

                var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp()

              await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand : body.brand }).forEach( (products) => {
                console.log(products.price)
                let oldPrice = products.price
                let offerPrice = products.price - products.price * parseInt(body.offerPercentage)/100
                console.log(parseInt(offerPrice))
                bulkOp.find({
                    '_id' : products._id
                }).updateOne({
                    '$set' : {
                        offer : true,
                        price : parseInt(offerPrice),
                        oldPrice : oldPrice
                    }
                })
                bulkOp.execute();
            })

               
                resolve(offerAdded = true)
            }
            else{
                resolve(offerAdded = false)
            }

        })
    },

    getAllBrandOffers : () => {

        return new Promise(async (resolve,reject) => {
            let offers = await db.get().collection(collection.OFFER_COLLECTION).find({
                offerTitle : 'brand'
            }).toArray()
            resolve(offers)
        })
    },

    deleteBrandOffer : (offerId) => {
        return new Promise(async (resolve,reject) => {

            let brand = await db.get().collection(collection.OFFER_COLLECTION).findOne({
                _id : ObjectID(offerId)
            })
            console.log("*****");
            console.log(brand);
            db.get().collection(collection.OFFER_COLLECTION).deleteOne({
                _id : ObjectID(offerId)
            })

            var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp()

            await db.get().collection(collection.PRODUCT_COLLECTION).find({ brand : brand.brand }).forEach( (products) => {
                console.log(products.price)
                let Price = products.oldPrice

                bulkOp.find({
                    '_id' : products._id
                }).updateOne({
                    '$set' : {
                        offer : false,
                        price : parseInt(Price),
                    }
                })
                bulkOp.execute();
            })

            resolve()
        })
    },

    getAllCategoryForOffers : () => {

        return new Promise(async (resolve,reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).aggregate([
                {
                    $project : {
                        categoryName : 1,
                        _id : 0
                    }
                }
            ]).toArray()
            console.log(category);
            resolve(category)   
        })
    },

    createCategoryOffer: (body) => {
        return new Promise( async (resolve,reject) => {

            let categoryExist = await db.get().collection(collection.OFFER_COLLECTION).findOne({
                category : body.category
            })

            if(categoryExist == null){
                db.get().collection(collection.OFFER_COLLECTION).insertOne({
                    category : body.category,
                    offer : parseInt(body.offerPercentage),
                    validity : body.validity,
                    offerFor : body.category,
                    offerTitle : 'category'
                })

                var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp()

                await db.get().collection(collection.PRODUCT_COLLECTION).find({ category : body.category }).forEach( (products) => {
                  console.log(products.price)
                  let oldPrice = products.price
                  let offerPrice = products.price - products.price * parseInt(body.offerPercentage)/100
                  console.log(parseInt(offerPrice))
                  
                  bulkOp.find({
                      '_id' : products._id
                  }).updateOne({
                      '$set' : {
                          offer : true,
                          price : parseInt(offerPrice),
                          oldPrice : oldPrice
                      }
                  })
                  bulkOp.execute();
              })


                resolve(offerAdded = true)
            }
            else{
                resolve(offerAdded = false)
            }

        })
    },

    getAllCategoryOffers : () => {
        return new Promise(async (resolve,reject) => {
            let offers = await db.get().collection(collection.OFFER_COLLECTION).find({
                offerTitle : 'category'
            }).toArray()
            resolve(offers)
        })
    },

    deleteCategoryOffer : (offerId) => {

        return new Promise(async (resolve,reject) => {

            let category = await db.get().collection(collection.OFFER_COLLECTION).findOne({
                _id : ObjectID(offerId)
            })
            console.log("*****");
            console.log(category);
    
            db.get().collection(collection.OFFER_COLLECTION).deleteOne({
                _id : ObjectID(offerId)
            })
    
            var bulkOp = db.get().collection(collection.PRODUCT_COLLECTION).initializeOrderedBulkOp()
    
            await db.get().collection(collection.PRODUCT_COLLECTION).find({ category : category.category }).forEach( (products) => {
                    console.log(products.price)
                    let Price = products.oldPrice
    
                    bulkOp.find({
                        '_id' : products._id
                    }).updateOne({
                        '$set' : {
                            offer : false,
                            price : parseInt(Price),
                        }
                    })
                    bulkOp.execute();
                })
            resolve()
        })
    }
}