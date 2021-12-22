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
router.get('/', function (req, res, next) {

  if (req.session.adminLogin) {
    res.render('admin/dashboard', {
      layout: 'admin/layout'
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
      })
    }
    res.redirect('/admin/addProduct')
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
router.get('/editProduct', function (req, res, next) {
  res.render('admin/editProducts')
});

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
router.get('/userManagement', async (req, res, next) => {

  let users = await userHelper.getUsersForAdmin()
  res.render('admin/userManagement', {
    layout: 'admin/layout',
    users: users
  })
})

// ********** product management ************
router.get('/productMangement', async (req, res, next) => {

  let orders = await adminProductHelper.getAllOrders()
  console.log("this is product management route");
  console.log(orders);
  res.render('admin/productManagement', {
    layout: 'admin/layout',
    orders: orders
  })
})

//*********** change status from admin  ************

router.post('/changeStatus',async (req, res, next) => {

  let orders = await adminProductHelper.getAllOrders()

  adminProductHelper.changeOrderStatus(req.body).then(() => {
    console.log("status changed");
    console.log(req.body.value);
    
    hb.render('views/admin/productManagement.hbs', {
      layout : 'admin/layout',
      orders: orders
    }).then((renderHtml) => {
      res.send(renderHtml)
    })
  })
})

module.exports = router;