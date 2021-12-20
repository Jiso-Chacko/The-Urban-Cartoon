var express = require('express');
var router = express.Router();
var db = require('../config/connections')
var collection = require('../config/collections')
var userProductHelper = require('../userhelpers/userProductHelper')
var userHelper = require('../userhelpers/userHelper')
var serviceId = "VA6a2e7c39a684110d315bb5f33dbaa6ea";
var accountSid = "AC32945c998d7d8a3d3f6e401b8947654b";
var authToken = "e751e3bec1f169a08d5ca694846b93d8";
var session = require('express-session')
var Swal = require('sweetalert2')
var hb = require('express-handlebars').create()

const client = require('twilio')(accountSid, authToken, {
  lazyLoading: true
});

var sigupData = {}
var loginPhonenumber = {}

// verify user function
// function verifyUserLogg (){
//   if(req.session.user){
//     res.redirect('/')
//     next()
//   }
//   else{
//     res.redirect('/login')
//   }
// }

// login get method
router.get('/login', (req, res, next) => {
  if (req.session.user) {
    res.redirect('/')
    next()
  } else {
    res.render('users/login', {
      "logInErr": req.session.userLoggedInErr
    })
    req.session.userLoggedInErr = false
  }

})

// login post method
router.post('/login', (req, res, next) => {

  userHelper.doLogin(req.body).then((response) => {
    console.log(response);
    if (response.userExist) {
      req.session.user = response.user
      req.session.userLoggedIn = response.userExist
      res.redirect('/')
    } else {
      req.session.userLoggedIn = false,
        req.session.userLoggedInErr = true
      res.redirect('/login')
    }
  }).catch((err) => {
    res.redirect('/login')
    console.log(err);
  })

})

// Phonenumber page for login
router.get('/enterPhn', (req, res, next) => {
  res.render('users/phoneNumber', {
    "phnExistErr": req.session.logInPhnErr
  })
  req.session.logInPhnErr = false
})

// phonenumber post for - login with phonenumber
router.post('/otplogin', (req, res, next) => {

  loginPhonenumber = req.body
  userHelper.getUserPhone(req.body).then(async (result) => {
    console.log(result);
    req.session.loginData = result
    req.session.user = result
    req.session.userLoggedIn = true
    let cartCount = await userProductHelper.getCartCount(result.phone._id)
    req.session.cartCount = cartCount

    if (result.status) {
      req.session.logInPhnErr = false
      client.verify.services(serviceId).verifications.create({
        to: `+91${req.body.phone}`,
        channel: "sms"
      }).then((result) => {
        res.redirect('/otp4Login')
      }).catch((err) => {
        console.log(err);
      })
    } else {
      req.session.logInPhnErr = true
      res.redirect('/enterPhn')
    }
  }).catch((err) => {
    console.log(err);
  })
})

// get otp page for login
router.get('/otp4login', (req, res, next) => {
  res.render('users/otp4Login', {
    "otpErr": req.session.optErr
  })
  req.session.optErr = false
})

// otp post method after entering login with otp
router.post('/verifyOtpLogin', getCartCount, (req, res, next) => {
  console.log(req.session.loginData);
  let num1 = req.body.first
  let num2 = req.body.second
  let num3 = req.body.third
  let num4 = req.body.fourth
  let otp = num1.concat(num2, num3, num4)
  console.log("This is verifyOtp4login");
  console.log(otp);
  client.verify.services(serviceId).verificationChecks.create({
    to: `+91${loginPhonenumber.phone}`,
    code: otp
  }).then((result) => {
    console.log(result);
    if (result.valid) {
      req.session.user = req.session.loginData
      req.session.userExist = true
      req.session.userLoggedIn = true
      req.session.optErr = false
      console.log("This is user after otplogin");
      console.log(req.session.user);
      res.redirect('/')
    } else {
      req.session.userExist = false
      req.session.optErr = true
      res.redirect('/otplogin')
    }
  }).catch((err) => {
    console.log(err);
  })
})


//get cart count
async function getCartCount(req, res, next) {
  if (req.session.userLoggedIn || req.session.user) {
    console.log("Enterd");
    console.log(req.session.user);
    let cartCount = await userProductHelper.getCartCount(req.session.user._id)
    req.session.cartCount = cartCount
    next()
  } else {
    next()
  }
}



/* GET home page. */
router.get('/', verifyUser, getCartCount, async function (req, res, next) {

  let slider = await userProductHelper.getAllSlider()
  let banner = await userProductHelper.getAllBanner()
  let products = await userProductHelper.getAllProducts()
  let featured = await userProductHelper.getAllFeatured()
  let topRated = await userProductHelper.getAllTopRated()
  let onSale = await userProductHelper.getAllOnsale()
  let laptop = await userProductHelper.getAllLaptop()
  let smartPhone = await userProductHelper.getAllSmartphone()

  if (req.session.user) {
    user = req.session.user.userFirstName
    userLoggedIn = req.session.userLoggedIn
    userCartCount = req.session.cartCount
    userId = req.session.user._id
  } else {
    userLoggedIn = false
    user = null
    userCartCount = null,
      userId = null
  }
  res.render('users/index', {
    layout: 'users/layout',
    slider: slider,
    banner: banner,
    featured: featured,
    topRated: topRated,
    onSale: onSale,
    laptop: laptop,
    smartPhone: smartPhone,
    products: products,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount,
    userId: userId
  });
});


// signup get method
router.get('/signup', (req, res, next) => {
  if (req.session.user) {
    res.redirect('/')
    next()
  } else {
    console.log("This is signup get router")
    console.log(req.session.userExists);
    res.render('users/signup', {
      "userErr": req.session.userExists
    })
    req.session.userExists = false
  }
})


// signup post method
router.post('/signup', (req, res, next) => {
  sigupData = req.body;
  console.log(sigupData);
  console.log("This is signup post");
  userHelper.getAllUsers(sigupData).then((response) => {
    console.log("This is response");
    if (response.userExist) {
      req.session.userExists = true,
        console.log(req.session.userExists);
      res.redirect('/signup')
    } else {
      req.session.userExists = false
      client.verify.services(serviceId).verifications.create({
        to: `+91${req.body.phone}`,
        channel: "sms"
      }).then((result) => {
        console.log(result);
        res.redirect('/otp')
      }).catch((err) => {
        console.log("Otp Error" + err);
      })
    }
  })

})

// otp get page during signup
router.get('/otp', (req, res, next) => {
  console.log("This is otp page");
  res.render('users/sampleOtp', {
    "otpErr": req.session.otpErr
  })
})

//otp post page during signup
router.post('/verifyOtp', (req, res, next) => {
  console.log(req.body);
  let num1 = req.body.first
  let num2 = req.body.second
  let num3 = req.body.third
  let num4 = req.body.fourth
  let otp = num1.concat(num2, num3, num4)
  console.log("This is otp post router");

  client.verify.services(serviceId).verificationChecks.create({
    to: `+91${sigupData.phone}`,
    code: otp
  }).then((result) => {
    console.log(result.valid);
    if (result.valid) {
      //store users data and redirect to home
      userHelper.doRegister(sigupData).then((result) => {
        // console.log("This is sign up after otp verification");
        // console.log(result);
        req.session.user = result;
        req.session.userLoggedIn = true
        req.session.userId = result._id
      }).catch((err) => {
        console.log(err);
      })
      res.redirect('/')
    } else {
      //show error message
      req.session.otpErr = true
      res.redirect('/otp')
    }
  }).catch((err) => {
    console.log(err);
  })
})





// logout
router.get('/logout', (req, res, next) => {

  req.session.user = null
  req.session.userLoggedIn = false
  res.redirect('/')
})


function verifyUserLogg(req, res, next) {
  if (req.session.user) {
    next()
  } else {
    res.redirect('/login')
  }
}

function verifyUser(req, res, next) {
  if (req.session.user) {
    req.session.userLoggedIn = true
    next()
  } else {
    req.session.userLoggedIn = false
    next()
  }
}

// This is view product example
router.get('/viewProduct', getCartCount, async (req, res, next) => {
  let proId = req.query.id
  console.log(proId);

  if (req.session.user) {
    user = req.session.user.userFirstName
    userLoggedIn = req.session.userLoggedIn
    userCartCount = req.session.cartCount
    userId = req.session.user._id
  } else {
    userLoggedIn = false
    user = null
    userCartCount = null,
      userId = null
  }

  let product = await userProductHelper.getProduct(proId)
  console.log("This is viewproduct");
  console.log(product[0]);
  res.render('users/viewProduct', {
    layout: 'users/layout',
    product: product,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount,
  })
})

// add to cart get method
router.get('/addToCart/:id', (req, res, next) => {

  console.log(req.params.id);
  if (req.session.user) {
    console.log("User exists");
    let userId = req.session.user._id;
    let proId = req.params.id;

    userProductHelper.addToCart(userId, proId).then((result) => {
      console.log(result.ops);
    })
    console.log("This is add to cart count in /addToCart");

    res.send(userStatus = true)
  }
  else {
    res.send(userStatus = false)
  }
})


// ******* add to wishlist get ajax call************

router.get('/addToWishlist/:id', (req, res, next) => {

  let response = {}
  console.log(req.params.id);
  console.log("This is /addtowishlist");
  if (req.session.user) {
    let userId = req.session.user._id;
    let proId = req.params.id;
    userProductHelper.addToWishlist(userId, proId).then((result) => {
      console.log("This is result");
      console.log(result.status);
      if (result.status) {
        res.send({
          userExist: true,
          status: true
        })
      } else {
        res.send({
          userExist: true,
          status: false
        })
      }
    })

  } else { 
    res.send({
      userExist: false,
      status: false
    })
  }

})


// cart get route
router.get('/cart', verifyUserLogg, getCartCount, async (req, res, next) => {

  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let price = await userProductHelper.getTotalAmount(req.session.user._id)
  for (var i = 0; i < cartProducts.length; i++) {
    cartProducts[i].individualSum = price.individualSum[i];
  }

  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount

  console.log("This is /cart");
  console.log(price.individualSum);
  console.log(price.totalSum);
  console.log(cartProducts);
  // let totalAmount =[]
  // for(i=0;i<cartProducts.length;i++){
  //   console.log(cartProducts[i].quantity);
  //   console.log(cartProducts[i].productDetails[0].price);
  //   price = Math.floor("cartProducts[i].productDetails[0].price")
  //  let total =  price * cartProducts[i].quantity
  //  totalAmount.push(total)
  //  console.log(totalAmount);
  // }
  res.render('users/cart', {
    layout: 'users/layout',
    "loggIn": userLoggedIn,
    userCartCount: req.session.cartCount,
    cartProducts: cartProducts,
    individualSum: price.individualSum,
    totalAmount: price.totalSum,
    user: user,
    userCartCount: userCartCount,
  })
})

// **** get wishlist *********
router.get('/wishlist', verifyUserLogg, getCartCount, async (req, res, next) => {

  let wishlistProducts = await userProductHelper.getProductsForWishlist(req.session.user._id)

  console.log("This is /wishlist");
  console.log(wishlistProducts);
  res.render('users/wishlist', {
    layout: 'users/layout',
    wishlistProducts : wishlistProducts
  })
})

// change product quantity
router.post('/changeQuantity', (req, res, next) => {
  let userId = req.body.userId
  userProductHelper.changeQuantity(req.body).then((response) => {
    userProductHelper.getTotalAmount(userId).then(async (result) => {
      console.log("This is get /changequantity");
      console.log(result);
      console.log(response);

      let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
      let price = await userProductHelper.getTotalAmount(req.session.user._id)
      for (var i = 0; i < cartProducts.length; i++) {
        cartProducts[i].individualSum = price.individualSum[i];
      }

      hb.render('views/users/cart.hbs', {
        layout: 'users/layout',
        "loggIn": userLoggedIn,
        userCartCount: req.session.cartCount,
        cartProducts: cartProducts,
        individualSum: price.individualSum,
        totalAmount: price.totalSum,
        user: user
      }).then((renderHtml) => {
        res.send({
          response,
          renderHtml
        })
      })
      // res.send(response)
    })
  })
})

// delete product in cart page 

router.post('/deleteProduct', (req, res, next) => {
  console.log("This is /deleteProduct");
  console.log(req.body);
  userProductHelper.deleteProductFromCart(req.body).then(async (result) => {

    let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
    let price = await userProductHelper.getTotalAmount(req.session.user._id)
    for (var i = 0; i < cartProducts.length; i++) {
      cartProducts[i].individualSum = price.individualSum[i];
    }
    hb.render('views/users/cart.hbs', {
      layout: 'users/layout',
      "loggIn": userLoggedIn,
      userCartCount: req.session.cartCount,
      cartProducts: cartProducts,
      individualSum: price.individualSum,
      totalAmount: price.totalSum
    }).then((renderHtml) => {
      res.send({
        status: result,
        renderHtml
      })
    })
  })
})

//*************** delete product in wishlist ajax call *****************

router.post('/removeWishlist', (req,res,next) => {
  console.log("This is /removeWishlist");
  console.log(req.session.user._id);
  console.log(req.body.proId);

  let userId = req.session.user._id
  let proId = req.body.proId

  userProductHelper.deleteProductFromWishlist(userId,proId).then(async (result) => {
  
  let wishlistProducts = await userProductHelper.getProductsForWishlist(req.session.user._id)


    hb.render('views/users/wishlist.hbs', {
      layout: 'users/layout',
      wishlistProducts : wishlistProducts
    }).then((renderHtml) => {
      res.send(renderHtml)
    })
    // res.send(result = true)
  })


})


// checkout get router 
router.get('/checkout', verifyUserLogg, getCartCount, async (req, res, next) => {

  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let price = await userProductHelper.getTotalAmount(req.session.user._id)
  let address = await userHelper.getAllAddress(req.session.user._id)
  console.log("This is /checkout");
  let UserAddress = address[0].address
  console.log(UserAddress);

  let userFname = req.session.user.userFirstName
  let userLname = req.session.user.userLastName
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount

  for (var i = 0; i < cartProducts.length; i++) {
    cartProducts[i].individualSum = price.individualSum[i];
  }



  res.render('users/checkout', {
    layout: 'users/layout',
    cartProducts: cartProducts,
    totalAmount: price.totalSum,
    userFname: userFname,
    userLname: userLname,
    address: UserAddress,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount
  })
})


// user profile get route
router.get('/viewProfile/:id', verifyUserLogg, getCartCount, (req, res, next) => {
  console.log(req.params.id);
  let userId = req.session.user._id
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount
  res.render('users/profile', {
    layout: 'users/layout',
    userId: userId,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount
  })
})

// address page get
router.get('/viewProfile/:id/address', verifyUserLogg, async (req, res, next) => {
  console.log("This is get address");
  let userId = req.session.user._id
  let address = await userHelper.getAllAddress(userId)
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount
  console.log(address);
  if (req.session.user.addressAdded) {
    req.session.addressMssg = true
  } else {

    req.session.addressMssg = false
  }

  res.render('users/address', {
    layout: 'users/layout',
    userId: userId,
    "Messg": req.session.addressMssg,
    address: address,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount
  })
  req.session.addressMssg = false
})

// address page post
router.post('/viewProfile/:id/address', verifyUserLogg, (req, res, next) => {
  console.log(req.body);
  console.log(req.body.addressType);
  let addressType = req.body.addressType
  let userId = req.session.user._id
  userHelper.addAddress(req.body, userId, addressType).then((result) => {
    console.log(result);
    if (result.status) {
      req.session.user.addressAdded = true
      req.session.user.addressErr = false
    } else {
      req.session.user.addressAdded = false
      req.session.user.addressErr = true
    }

    res.redirect('/viewProfile/:id/address')
  }).catch((err) => {
    console.log(err);
  })
})


// ******** sweet alert sample *************
router.get('/sweetAlert', (req, res, next) => {
  res.render('users/sweetAlertSample', {
    layout: 'users/layout'
  })
})



router.get('/zoom',(req,res,next) => {
  res.render('users/sweetAlertSample')
})

module.exports = router;