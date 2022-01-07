var express = require('express');
var router = express.Router();
var db = require('../config/connections')
var collection = require('../config/collections')
var adminProductHelper = require('../adminhelpers/adminProductHelper')
var fs = require('fs')
const multer = require('multer')
const path = require('path');
const {
  response
} = require('express');
const userHelper = require('../userhelpers/userHelper');
var hb = require('express-handlebars').create()



var username = "jiso"
var password = 987


const verifyAdminLogin = (req, res, next) => {
  if (req.session.adminLogin) {
    next()
  } else {
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/',async function (req, res, next) {

  if (req.session.adminLogin) {
    let totalOrders = await adminProductHelper.getAllOrders()
    let orders = totalOrders.length
    let totalSales = await adminProductHelper.getTotalSales() 
    let totalProfit = parseInt(totalSales - totalSales * (10/100)) 
    let graphData = await adminProductHelper.categoryWiseChartData()
    let donutCartData = await adminProductHelper.brandWiseChartData()

    console.log("**///");
    console.log(donutCartData.count);
    console.log(donutCartData.brands);
    let brands = donutCartData.brands
    let brandCount = donutCartData.count
    let smartPhoneCount = graphData.smartPhone
    let laptopCount = graphData.laptop
    res.render('admin/dashboard', {
      layout: 'admin/layout',
      orders : orders,
      totalSales : totalSales,
      totalProfit : totalProfit,
      smartPhoneCount : smartPhoneCount,
      laptopCount : laptopCount,
      brands : brands,
      brandCount : brandCount
    });
  } else {
    res.redirect('/admin/login')
  }


});

router.get('/login', function (req, res, next) {
  if (req.session.adminLogin) {
    res.redirect('/admin')
  } else {

    res.render('admin/login', {
      "loginErr": req.session.adminLoginErr,
      "loginNull": req.session.adminLoginNull
    });
    req.session.adminLoginErr = false;
    req.session.adminLoginNull = false;
  }
});

//admin login 
router.post('/login', (req, res) => {
  if (req.body.username == username && req.body.password == password) {

    req.session.adminLogin = true;
    req.session.adminLoginErr = false;
    req.session.admin = req.body
    res.redirect('/admin')
  } else if (req.body.username == "" || req.body.password == "") {
    req.session.adminLogin = false
    req.session.adminLoginErr = true
    req.session.adminLoginNull = true
    res.redirect('/admin/login')
  } else {
    req.session.adminLogin = false
    req.session.adminLoginErr = true
    res.redirect('/admin/login')
  }
})

// Get addCategory
router.get('/addCategory', verifyAdminLogin, async function (req, res, next) {

  let brands = await adminProductHelper.getAllBrands()
  console.log("This is brands");
  console.log(brands);
  res.render('admin/addCategory', {
    layout: 'admin/layout',
    "brandExists": req.session.brandExists,
    brands: brands
  });
  req.session.brandExists = false

});


// add Category post
router.post('/addCategory', function (req, res, next) {
  // console.log(req.body);
  adminProductHelper.addCategory(req.body).then((response) => {
    console.log("This is /addCategory");
    if (response.status) {
      req.session.categoryAdded = true
      res.redirect('/admin/addCategory')
    } else if (response.status == false) {
      console.log("This is brandExists");
      req.session.brandExists = true
    }
    res.redirect('/admin/addCategory')
  })
});

// ********** addNewCategory ***************** 
router.get('/addNewCategory', async (req, res, next) => {
  let brands = await adminProductHelper.getAllBrands()
  res.render('admin/category', {
    layout: 'admin/layout',
    brands: brands
  })
})

// Get addProduct
router.get('/addProduct', verifyAdminLogin, async function (req, res, next) {

  let category = await adminProductHelper.getAllCategory()
  console.log(category[0].categoryName);
  smartPhoneBrands = category[0].brand
  laptopBrands = category[1].brand
  if (category[0].categoryName == "smartphone") {
    req.session.smartphoneValue = true
  } else if (category[1].categoryName == "laptop") {
    req.session.laptopValue = true
  }
  res.render('admin/addProducts', {
    layout: 'admin/layout',
    category: category,
    smartPhoneBrands: smartPhoneBrands,
    laptopBrands: laptopBrands,
    smartphoneTrue: req.session.smartphoneValue,
    laptopTrue: req.session.laptopValue
  });

});

// get brands from category
router.get('/getbrands/:category', verifyAdminLogin, function (req, res, next) {
  adminProductHelper.getCategoryByName(req.params.category).then((categoryFind) => {
    console.log(categoryFind);
    res.send(categoryFind);
  })
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/productimages")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage
})

const imageUpload = upload.fields([{
  name: 'fileinputimage1',
  maxCount: 1
}, {
  name: 'fileinputimage2',
  maxCount: 1
}, {
  name: 'fileinputimage3',
  maxCount: 1
}, {
  name: 'fileinputimage4',
  maxCount: 1
}]) // product image upload

// POST addProduct
router.post('/addProduct', function (req, res, next) {

  imageUpload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      // console.log("This is addProduct"); 
      // console.log(req.body);
      console.log(res.req.body);
      var body = res.req.body
      // console.log(req.files.fileinputimage1[0].filename);

      var images = [req.files.fileinputimage1[0].filename, req.files.fileinputimage2[0].filename, req.files.fileinputimage3[0].filename, req.files.fileinputimage4[0].filename]
      console.log("Success");
      adminProductHelper.addProduct(body, images, (id) => {
        console.log(id);
        res.redirect('/admin/viewProducts')
      })

    }
  })
})



// get viewProducts
router.get('/viewProducts', verifyAdminLogin, function (req, res, next) {
  adminProductHelper.getallProducts().then((products) => {
    console.log(products);
    console.log(products[0].imageName[0]);
    imageName = products[0].imageName[0];
    res.render('admin/viewProduct', {
      layout: 'admin/layout',
      product: products,
      imageName: imageName
    })
  })
});

// get editProducts
router.get('/editProduct', verifyAdminLogin, async function (req, res, next) {
  console.log("edit product route");
  console.log(req.query.id);
  let product = await adminProductHelper.getProduct(req.query.id)
  res.render('admin/editProducts', {
    product: product
  })
});

const updateImage = upload.fields([{
    name: 'fileinputimage1',
    maxCount: 1
  }, {
    name: 'fileinputimage2',
    maxCount: 1
  }, {
    name: 'fileinputimage3',
    maxCount: 1
  },
  {
    name: 'fileinputimage4',
    maxCount: 1
  }
]) // product image upload


// ************* edit product post *****************
router.post('/editProduct', verifyAdminLogin, (req, res, next) => {

  updateImage(req, res, async (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(req.query.id);
      console.log(Object.keys(res.req.files).length);
      console.log(Object.keys(res.req.files).includes('fileinputimage1'))
      if (Object.keys(res.req.files).length == 0) {
        console.log('lengeth is 0')
        let images = await adminProductHelper.getImages(req.query.id)
        adminProductHelper.updateProduct(req.query.id, res.req.body, images)
      }
      else if (Object.keys(res.req.files).length == 1) {
            console.log("length is 1");

            if (Object.keys(res.req.files).includes('fileinputimage1') == true) {
              console.log("img1");
              console.log(res.req.files);
              console.log(req.body);
              let image1 = res.req.files.fileinputimage1[0].filename
              adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
            } 
            else if (Object.keys(res.req.files).includes('fileinputimage2') == true) {
              console.log("img2");
              console.log(res.req.files);
              console.log(req.body);
              let image2 = res.req.files.fileinputimage2[0].filename
              adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
            }
            else if (Object.keys(res.req.files).includes('fileinputimage3' == true)) {
              console.log("img3");
              console.log(res.req.files);
              console.log(req.body);
              let image3 = res.req.files.fileinputimag3[0].filename
              adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
            }
            else if (Object.keys(res.req.files).includes('fileinputimage4') == true) {
              console.log("img4");
              console.log(res.req.files);
              console.log(req.body);
              let image4 = res.req.files.fileinputimage4[0].filename
              adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
            }

      } 
      else if (Object.keys(res.req.files).length == 2) {
        console.log("length is 2");
          if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage2') == true){
            console.log(" 1 & 2");
              if(Object.keys(res.req.files).includes('fileinputimage1') == true){
                console.log(res.req.files);
                console.log(req.body);
                let image1 = res.req.files.fileinputimage1[0].filename
                adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
              }
              if(Object.keys(res.req.files).includes('fileinputimage2') == true){
                console.log(res.req.files);
                console.log(req.body);
                let image2 = res.req.files.fileinputimage2[0].filename
                adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage3') == true){
              console.log("1 & 3");
              if(Object.keys(res.req.files).includes('fileinputimage1') == true){
                console.log(req.body);
                let image1 = res.req.files.fileinputimage1[0].filename
                adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
              }
              else if(Object.keys(res.req.files).includes('fileinputimage3') == true){
                console.log(req.body);
                let image3 = res.req.files.fileinputimage3[0].filename
                adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log("1 & 4");
              if(Object.keys(res.req.files).includes('fileinputimage1') == true){
                console.log(req.body);
                let image1 = res.req.files.fileinputimage1[0].filename
                adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
              }
              else if(Object.keys(res.req.files).includes('fileinputimage4') == true){
                console.log(req.body);
                let image4 = res.req.files.fileinputimage4[0].filename
                adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage2') == true && Object.keys(res.req.files).includes('fileinputimage3') == true){
              console.log("2 & 3");
              if(Object.keys(res.req.files).includes('fileinputimage2') == true){
                console.log(req.body);
                let image2 = res.req.files.fileinputimage2[0].filename
                adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
              }
              else if(Object.keys(res.req.files).includes('fileinputimage3') == true){
                console.log(req.body);
                let image3 = res.req.files.fileinputimage3[0].filename
                adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage2') == true && Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log("2 & 4");
              if(Object.keys(res.req.files).includes('fileinputimage2') == true){
                console.log(req.body);
                let image2 = res.req.files.fileinputimage2[0].filename
                adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
              }
              else if(Object.keys(res.req.files).includes('fileinputimage4') == true){
                console.log(req.body);
                let image4 = res.req.files.fileinputimage4[0].filename
                adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage3') == true && Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log("3 & 4");
              if(Object.keys(res.req.files).includes('fileinputimage3') == true){
                console.log(req.body);
                let image3 = res.req.files.fileinputimage3[0].filename
                adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
              }
              else if(Object.keys(res.req.files).includes('fileinputimage4') == true){
                console.log(req.body);
                let image4 = res.req.files.fileinputimage4[0].filename
                adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
              }
          }



      } else if (Object.keys(res.req.files).length == 3) {
        console.log("length is 3");

          if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage2') == true && Object.keys(res.req.files).includes('fileinputimage3') == true){
              console.log("images 1,2,3");

              if(Object.keys(res.req.files).includes('fileinputimage1') == true){
                console.log(req.body);
                let image1 = res.req.files.fileinputimage1[0].filename
                adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
              }

              if(Object.keys(res.req.files).includes('fileinputimage2') == true){
                console.log(req.body);
                let image2 = res.req.files.fileinputimage2[0].filename
                adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
              }

              if(Object.keys(res.req.files).includes('fileinputimage3') == true){
                console.log(req.body);
                let image3 = res.req.files.fileinputimage3[0].filename
                adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
              }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage3') == true && Object.keys(res.req.files).includes('fileinputimage4') == true){
            console.log("images 1,3,4");

            if(Object.keys(res.req.files).includes('fileinputimage1') == true){
              console.log(req.body);
              let image1 = res.req.files.fileinputimage1[0].filename
              adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
            }

            if(Object.keys(res.req.files).includes('fileinputimage3') == true){
              console.log(req.body);
              let image3 = res.req.files.fileinputimage3[0].filename
              adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
            }

            if(Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log(req.body);
              let image4 = res.req.files.fileinputimage4[0].filename
              adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
            }
          }
          else if(Object.keys(res.req.files).includes('fileinputimage1') == true && Object.keys(res.req.files).includes('fileinputimage4') == true && Object.keys(res.req.files).includes('fileinputimage2') == true){
            console.log("images 1,4,2");

            if(Object.keys(res.req.files).includes('fileinputimage1') == true){
              console.log(req.body);
              let image1 = res.req.files.fileinputimage1[0].filename
              adminProductHelper.updateProductimg1(req.query.id, res.req.body, image1)
            }

            if(Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log(req.body);
              let image4 = res.req.files.fileinputimage4[0].filename
              adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
            }

            if(Object.keys(res.req.files).includes('fileinputimage2') == true){
              console.log(req.body);
              let image2 = res.req.files.fileinputimage2[0].filename
              adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
            }

          }
          else if(Object.keys(res.req.files).includes('fileinputimage2') == true && Object.keys(res.req.files).includes('fileinputimage3') == true && Object.keys(res.req.files).includes('fileinputimage4') == true){
            console.log("images 2,3,4");

            if(Object.keys(res.req.files).includes('fileinputimage2') == true){
              console.log(req.body);
              let image2 = res.req.files.fileinputimage2[0].filename
              adminProductHelper.updateProductimg2(req.query.id, res.req.body, image2)
            }

            if(Object.keys(res.req.files).includes('fileinputimage3') == true){
              console.log(req.body);
              let image3 = res.req.files.fileinputimage3[0].filename
              adminProductHelper.updateProductimg3(req.query.id, res.req.body, image3)
            }

            if(Object.keys(res.req.files).includes('fileinputimage4') == true){
              console.log(req.body);
              let image4 = res.req.files.fileinputimage4[0].filename
              adminProductHelper.updateProductimg4(req.query.id, res.req.body, image4)
            }

          }

      } else if (Object.keys(res.req.files).length == 4) {
        console.log("length is 4");
        let images = [res.req.files.fileinputimage1[0].filename, res.req.files.fileinputimage2[0].filename, res.req.files.fileinputimage3[0].filename, res.req.files.fileinputimage4[0].filename]
        console.log(images);
        adminProductHelper.updateProduct(req.query.id, res.req.body, images)
      }

    }
  })

  // console.log(req.files);
  res.redirect('/admin/viewProducts')
})


// get addSlider
router.get('/addSlider', verifyAdminLogin, function (req, res, next) {

  adminProductHelper.getAllSlider().then((slider) => {
    console.log("This is getallslider");
    // console.log(slider)
    res.render('admin/addSlider', {
      layout: 'admin/layout',
      slider: slider
    })
  })

});

const sliderImageUpload = upload.fields([{
  name: 'fileinputimage1',
  maxCount: 1
}]) // slider image upload

// Post addSlider
router.post('/addSlider', function (req, res, next) {

  sliderImageUpload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      let body = res.req.body
      let image = req.files.fileinputimage1[0].filename
      adminProductHelper.addNewSlider(body, image, (id) => {
        console.log(id);
      })
    }
  })
  res.redirect('/admin/addSlider')
});


// edit sider get
router.get('/editSlider', verifyAdminLogin, function (req, res, next) {
  res.render('admin/editSlider')
});

// edit slider post
router.post('/editSlider', function (req, res, next) {

  sliderImageUpload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      let body = res.req.body
      let image = req.files.fileinputimage1[0].filename
      adminProductHelper.addNewSlider(body, image, (id) => {
        console.log(id);
      })
    }
  })
  res.redirect('/admin/addSlider')
});

// Add banner get
router.get('/addBanner', verifyAdminLogin, function (req, res, next) {

  adminProductHelper.getAllBanner().then((banner) => {
    console.log("This is getallBanner");
    // console.log(slider)
    res.render('admin/addBanner', {
      layout: 'admin/layout',
      banner: banner
    })
  })

});


const bannerImageUpload = upload.fields([{
  name: 'fileinputimage1',
  maxCount: 1
}]) // banner image upload

// Add banner post
router.post('/addBanner', function (req, res, next) {

  bannerImageUpload(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      let body = res.req.body
      let image = req.files.fileinputimage1[0].filename
      adminProductHelper.addNewBanner(body, image, (id) => {
        console.log(id);
      })
    }
  })
  res.redirect('/admin/addBanner')
});

// edit banner get
router.get('/editBanner', verifyAdminLogin, function (req, res, next) {
  res.render('admin/editBanner')
});

// **** logout *****

router.get('/logout', (req, res, next) => {
  req.session.destroy()
  res.redirect('/admin/login')
})

// **** delete product *******
router.get('/deleteProduct', verifyAdminLogin, (req, res, next) => {
  let proId = req.query.id

  adminProductHelper.deleteProduct(proId).then((result) => {})
  res.redirect('/admin/viewProducts')
})

// ********* user Mangement **********
router.get('/userManagement',verifyAdminLogin, async (req, res, next) => {

  let users = await userHelper.getUsersForAdmin()
  res.render('admin/userManagement', {
    layout: 'admin/layout',
    users: users
  })
})

// ********** product management ************
router.get('/productMangement',verifyAdminLogin, async (req, res, next) => {

  let orders = await adminProductHelper.getAllOrders()
  console.log("this is product management route");
  console.log(orders);
  res.render('admin/productManagement', {
    layout: 'admin/layout',
    orders: orders
  })
})

//*********** change status from admin  ************

router.post('/changeStatus', async (req, res, next) => {

  let orders = await adminProductHelper.getAllOrders()

  adminProductHelper.changeOrderStatus(req.body).then(() => {
    console.log("status changed");
    console.log(req.body);

    hb.render('views/admin/productManagement.hbs', {
      layout: 'admin/layout',
      orders: orders
    }).then((renderHtml) => {
      res.send(renderHtml)
    })
  })
})

// ********** cancel product from admin side **********
router.post('/cancelProduct', (req, res, next) => {

  console.log(req.body);
  adminProductHelper.changeOrderStatus(req.body)
  res.send('Cancelled product')
})

router.get('/imageCrop', (req, res, next) => {


  res.render('admin/imageCropSample', {
    layout: 'admin/layout'
  })
})

const imageUploadSample = upload.fields([{
  name: 'fileinputimage4',
  maxCount: 1
}]) // product image upload


router.post('/imageCrop', (req, res, next) => {

  imageUploadSample(req, res, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("success");
    }
    res.send("Image uploaded successfully")
  })
})

router.get('/swalForm', (req, res, next) => {

  res.render('admin/swalFormSample', {
    layout: 'admin/layout'
  })
})

// ********* block user ******************
router.get('/disable_user',verifyAdminLogin,(req,res,next) => {

  console.log(req.query.id);
  console.log("/disable_user");
  userHelper.blockUser(req.query.id).then((response)  => {
    res.send(response)
  })
})

// ********* unblock user ******************
router.get('/enable_user',verifyAdminLogin,(req,res,next) => {

  console.log(req.query.id);
  console.log("/enable_user");
  userHelper.unblockUser(req.query.id).then((response)  => {
    res.send(response)
  })
})

// ************* coupon management get page************
router.get('/couponManagement',async (req,res,next) => {

  let coupon = await adminProductHelper.getAllCoupen()
  console.log(coupon);
  res.render('admin/couponManagement',{
    layout : 'admin/layout',
    coupon : coupon,
    "couponErr": req.session.couponErr
  })
  req.session.couponErr = false
})

router.post('/addCoupen',(req,res,next) => {
  console.log(req.body);

  adminProductHelper.createCoupon(req.body).then((created) => {
    if(created ==true) {
      res.redirect('/admin/couponManagement')
    }
    else{
      req.session.couponErr = true
      res.redirect('/admin/couponManagement')
    }
  })
})

// ******** delete coupon **********
router.get('/deleteCoupon/:id',(req,res,next) => {

  console.log(req.params.id);
  adminProductHelper.deleteCoupon(req.params.id).then(() => {

    res.send("success")
  })
})

// *************** brand offer management *********
router.get('/brandOffers',async (req,res,next) => {

  let brands = await adminProductHelper.getAllBrandsForOffers()
  let brandOffers = await adminProductHelper.getAllBrandOffers()
  console.log("*******" + brandOffers);
  console.log(brands);
  res.render('admin/brandofferManagement',{
    layout : 'admin/layout',
    brands : brands,
    'offerErr' : req.session.offerErr,
    brandOffers : brandOffers
  })
  req.session.offerErr = false
})

// *************** brand offer management post *******
router.post('/addBrandOffer', (req,res,next) => {

  console.log(req.body);
  adminProductHelper.createBrandOffer(req.body).then((response) => {
    if(response == true){
      res.redirect('/admin/brandOffers')
    }
    else{
      req.session.offerErr = true
      res.redirect('/admin/brandOffers')
    }
  })
 
})

// *********** delete offer ******************
router.get('/deleteOffer/:id',(req,res,next) => {

  console.log(req.params.id);
  adminProductHelper.deleteBrandOffer(req.params.id).then(() => {
    res.send("success")
  })
})

// *************** category offer management ********
router.get('/categoryOffers',async (req,res,next) => {

  let category = await adminProductHelper.getAllCategoryForOffers()
  let categoryOffers = await adminProductHelper.getAllCategoryOffers()
  res.render('admin/categoryOfferManagement',{
    layout : 'admin/layout',
    category : category,
    categoryOffers : categoryOffers
  })
})

// *************** category offer management post *******
router.post('/addCategoryOffer', (req,res,next) => {

  console.log(req.body);
  adminProductHelper.createCategoryOffer(req.body).then((response) => {
    if(response == true){
      res.redirect('/admin/categoryOffers')
    }
    else{
      req.session.offerErr = true
      res.redirect('/admin/categoryOffers')
    }
  })

})

// ************ delete category offer *******
router.get('/deleteCategoryOffer/:id',(req,res,next) => {

  console.log(req.params.id);
  adminProductHelper.deleteCategoryOffer(req.params.id).then(() => {
    res.send("success")
  })
})

// ******* sales report get page *********
router.get('/salesReport', async (req,res,next) => {
  let revenue =[]
  let products = await adminProductHelper.getSalesReport()
  
  for(i=0;i<products.length;i++){
    let value = products[i].products.productDetails[0].price - products[i].products.productDetails[0].price*0.1
    products[i].revenue = parseInt(value);
  }
  console.log(revenue);
  res.render('admin/salesReport',{
    layout : 'admin/layout',
    products : products,
  })
})

// ************ search product with date sales report ***********
router.get('/searchProductDate',(req,res,next) => {
  console.log(req.query); 
  adminProductHelper.getSalesReportByDate(req.query)
  res.redirect('/admin/salesReport')
})

module.exports = router;