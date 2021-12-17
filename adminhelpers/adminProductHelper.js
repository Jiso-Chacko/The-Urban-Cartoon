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
    }
}