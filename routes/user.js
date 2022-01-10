var express = require('express');
var router = express.Router();
var db = require('../config/connections')
var collection = require('../config/collections')
var userProductHelper = require('../userhelpers/userProductHelper')
var userHelper = require('../userhelpers/userHelper')
const multer = require('multer')
const path = require('path');
const paypal = require('paypal-rest-sdk');

var serviceId = "VA6a2e7c39a684110d315bb5f33dbaa6ea";
var accountSid = "AC32945c998d7d8a3d3f6e401b8947654b";
var authToken = "e751e3bec1f169a08d5ca694846b93d8";
var session = require('express-session')
var Swal = require('sweetalert2')
var hb = require('express-handlebars').create()

const client = require('twilio')(accountSid, authToken, {
  lazyLoading: true
});

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AV1osUK-SmdJTr4qkz3kFQj7_M_LoqcxqP-st1MUIYxYBctQhTKbQl8DbVvV63DaT6RMp3QxCMj2VXny',
  'client_secret': 'EDY5h9B3NyWgIcEa2zoswhWeZ5xcm_W4JXXK4087AO9FjOvbYjTcDHsVEZpP0e20X3KJRIyf78x4cPxx'
});

var sigupData = {}
var loginPhonenumber = {}
let count = 0

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
    console.log("************");
    console.log(result);
    console.log(req.body.phone);
    console.log(result.phone.userPhone);
    phoneNumber = parseInt(result.phone.userPhone)
    req.session.loginData = result
    req.session.user = result
    req.session.userLoggedIn = true
    let cartCount = await userProductHelper.getCartCount(result.phone._id)
    req.session.cartCount = cartCount

    if (result.status == true) {
      req.session.logInPhnErr = false
      client.verify.services(serviceId).verifications.create({
        to: `+91${result.phone.userPhone}`,
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
    console.log("This is get cart count");
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
  console.log("******");
  console.log("This is viewproduct");
  console.log(product);
  res.render('users/viewProduct', {
    layout: 'users/layout',
    product: product,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount,
  })
})

// add to cart ajax call
router.post('/addToCart', async (req, res, next) => {

  if (req.session.user) {
    console.log("User exists");
    proId = req.body.proId
    userId = req.session.user._id
    await userProductHelper.addToCart(userId, proId).then((cartCount) => {
      console.log(cartCount);
      req.session.cartCount = cartCount
    })

    user = req.session.user.userFirstName
    userLoggedIn = req.session.userLoggedIn

    console.log("This is add to cart count in /addToCart");
    console.log(userId);
    console.log(req.session.cartCount);
    // res.send(userStatus = true)
    hb.render('views/users/layout.hbs', {
      "loggIn": userLoggedIn,
      user: user,
      userCartCount: req.session.cartCount,
      userId: userId

    }).then((renderHtml) => {
      res.send({
        userStatus: true,
        renderHtml
      })
    })

  } else {
    userLoggedIn = false
    user = null
    userCartCount = null,
      userId = null
    res.send({
      userStatus: false
    })
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
    wishlistProducts: wishlistProducts
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

router.post('/removeWishlist', (req, res, next) => {
  console.log("This is /removeWishlist");
  console.log(req.session.user._id);
  console.log(req.body.proId);

  let userId = req.session.user._id
  let proId = req.body.proId

  userProductHelper.deleteProductFromWishlist(userId, proId).then(async (result) => {

    let wishlistProducts = await userProductHelper.getProductsForWishlist(req.session.user._id)


    hb.render('views/users/wishlist.hbs', {
      layout: 'users/layout',
      wishlistProducts: wishlistProducts
    }).then((renderHtml) => {
      res.send(renderHtml)
    })
    // res.send(result = true)
  })


})


// checkout get router 
router.get('/checkout', verifyUserLogg, getCartCount, async (req, res, next) => {
  if(req.session.cartCount != 0){

  

  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let price = await userProductHelper.getTotalAmount(req.session.user._id)
  let address = await userHelper.getAllAddress(req.session.user._id)
  let addressType = await userHelper.getAllAddressType(req.session.user._id)

  req.session.totalAmount = price.totalSum
  req.session.coupon = {}
  req.session.coupon.Applied =  false
  req.session.coupon.code = null
  console.log("This is /checkout get");
  console.log("Address  : " + address.address);

  if (address.status == false) {
    req.session.addressErr = true
    req.session.userAddress = null
  } else {
    // req.session.userAddress = address.address[0]
    req.session.addressErr = false
  }
  console.log(req.session);

  let userFname = req.session.user.userFirstName
  let userLname = req.session.user.userLastName
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount
  userId = req.session.user

  for (var i = 0; i < cartProducts.length; i++) {
    cartProducts[i].individualSum = price.individualSum[i];
  }

  res.render('users/checkout', {
    layout: 'users/layout',
    cartProducts: cartProducts,
    productCount :  cartProducts.length,
    totalAmount: req.session.totalAmount,
    userFname: userFname,
    userLname: userLname,
    "addressErr": req.session.addressErr,
    "loggIn": userLoggedIn,
    user: user,
    userId: userId,
    userCartCount: userCartCount,
    addressType: addressType,
    address: address.address
  })
  req.session.invalidCoupon = false

}
else{
  res.redirect('/')
}
})



// ************** checkout post router *********************
router.post('/checkout', verifyUserLogg, async (req, res, next) => {
  console.log("This is /checkout post");
  console.log(req.body);
  // console.log(req.session.user._id);
  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let totalAmount = await userProductHelper.getTotalAmount(req.session.user._id)
  let address = await userHelper.getAddress(req.session.user._id, req.body.address)

  console.log("///////");
  address.address.firstName = req.session.user.userFirstName
  address.address.lastName = req.session.user.userLastName
  address.address.payment = req.body.payment
  console.log(address.address);
  console.log("###### coupon applied before place order #######");
  console.log(req.session.coupon);
  await userProductHelper.placeOrder(req.session.user._id, address.address, cartProducts, req.session.totalAmount,req.session.coupon).then((orderId) => {

    if (req.body.payment === 'cod') {
      res.send({
        status: true,
        response: null,
        payment : 'cod'
      })
    }
     else {

      userProductHelper.generateRazorpay(orderId, req.session.totalAmount).then((response) => {
        res.send({
          status: false,
          response,
          payment : 'razorpay'
        })
      })
    }
  })
})

// ************ paypal post route for billing details *********
router.post('/pay', (req, res) => {
  console.log("******** paypal *************");
  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/success",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Red Sox Hat",
                "sku": "001",
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "Hat for the best team ever"
    }]
};

paypal.payment.create(create_payment_json, function (error, payment) {
  if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          // res.redirect(payment.links[i].href);
          res.json({forwardLink: payment.links[i].href});
        }
      }
  }
});

});

router.get('/success', (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
    }
});
});

router.get('/cancel', (req, res) => res.send('Cancelled'));

// ************* checkout with new address save post route ******
router.post('/checkoutNewAddressSave', verifyUserLogg, async (req, res, next) => {

  console.log("/checkoutNewAddressSave");
  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let totalAmount = await userProductHelper.getTotalAmount(req.session.user._id)
  console.log(req.body);
  let address = {}
  address.addressType = req.body.addressType
  address.address = req.body.address
  address.city = req.body.city
  address.district = req.body.district
  address.postcode = req.body.postcode
  address.state = req.body.state
  address.email = req.body.email
  address.phone = req.body.phone
  await userHelper.addAddress(address, req.session.user._id, req.body.addressType)
  await userProductHelper.placeOrder(req.session.user._id, req.body, cartProducts, req.session.totalAmount).then((orderId) => {
    if (req.body.payment === 'cod') {
      res.send({
        status: true,
        response: null
      })
    } else {
      userProductHelper.generateRazorpay(orderId, req.session.totalAmount).then((response) => {
        res.send({
          status: false,
          response
        })
      })
    }
  })
})


// ************* checkout with new address dont save post route ******
router.post('/checkoutNewAddress', verifyUserLogg, async (req, res, next) => {

  console.log("/checkoutNewAddress");
  let cartProducts = await userProductHelper.getProductsForCart(req.session.user._id)
  let totalAmount = await userProductHelper.getTotalAmount(req.session.user._id)
  console.log(req.body);
  let address = {}
  address.addressType = req.body.addressType
  address.address = req.body.address
  address.city = req.body.city
  address.district = req.body.district
  address.postcode = req.body.postcode
  address.state = req.body.state
  address.email = req.body.email
  address.phone = req.body.phone

  await userProductHelper.placeOrder(req.session.user._id, req.body, cartProducts, req.session.totalAmount).then((orderId) => {
    if (req.body.payment === 'cod') {
      res.send({
        status: true,
        response: null
      })
    } else {
      userProductHelper.generateRazorpay(orderId, req.session.totalAmount).then((response) => {
        res.send({
          status: false,
          response
        })
      })
    }
  })

})

// ********************* order success get page ***********************
router.get('/orderSuccess', async (req, res, next) => {
  console.log(req.session.user);
  userDetails = req.session.user;
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  let order = await userProductHelper.getOneOrder(req.session.user._id)
  console.log(order.date);
  res.render('users/orderSuccess', {
    layout: 'users/layout',
    "loggIn": userLoggedIn,
    user: user,
    userDetails: userDetails,
    order: order.result,
    deliveryDate: order.date
  })
})


// ****************** razorpay verifypayment router **************
router.post('/verifyPayment', verifyUserLogg, (req, res, next) => {
  console.log("This is verify payment router");
  console.log(req.session.user._id);
  console.log(req.body);
  userProductHelper.verifyPayment(req.body).then((result) => {
    userProductHelper.changePaymentStatus(req.body['order[receipt]'], req.session.user._id,req.session.coupon).then((response) => {
      console.log("Payment successful");
      res.send({
        status: true
      })
    }).catch((err) => {
      console.log(err);
      res.send({
        status: false
      })
    })
  })
})

// user profile get route
router.get('/viewProfile/:id', verifyUserLogg, getCartCount, (req, res, next) => {
  console.log(req.params.id);
  console.log(`---------------------------------testing---------------------------------------`)
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

// ************** address page get ****************
router.get('/viewProfile/:id/address', verifyUserLogg, async (req, res, next) => {
  console.log("This is get address");
  let userId = req.session.user._id
  let address = await userHelper.getAllAddress(userId)
  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount

  if (req.session.addressLengthErr === true) {
    var blockNewAdderess = true
  } else {
    var blockNewAdderess = false
  }

  let userAddress = address.address
  if (address.status == false) {
    req.session.addressErr = true
  } else {
    req.session.addressErr = false
  }

  if (req.session.user.addressAdded) {
    req.session.addressMssg = true
  } else {

    req.session.addressMssg = false
  }

  res.render('users/address', {
    layout: 'users/layout',
    userId: userId,
    "Messg": req.session.addressMssg,
    "addressErr": req.session.addressErr,
    address: userAddress,
    "loggIn": userLoggedIn,
    user: user,
    userCartCount: userCartCount,

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


// ****************** edit address get ************
router.get('/editAddress', verifyUserLogg, async (req, res, next) => {

  console.log("Entered edit address");
  console.log("This is type" + req.query.type);
  console.log(req.session.user._id);

  let address = await userHelper.getAddress(req.session.user._id, req.query.type)
  res.render('users/editAddress', {
    layout: 'users/layout',
    userId: req.session.user._id,
    address: address
  })
})

// ****************** edit address post ******************
router.post('/editAddress/:id/:type', verifyUserLogg, async (req, res, next) => {

  console.log("This is edit address post");
  console.log(req.body);
  console.log(req.body.addressType);
  userHelper.editAddress(req.session.user._id, req.body.addressType, req.body).then(() => {
    // res.redirect('/viewProfile/:id/address')
    res.redirect(`/viewProfile/:${req.session.user._id}/address`)

  })
})

// ****************** delete address post ajax ************
router.post('/deleteAddress', async (req, res, next) => {

  console.log(req.body);
  let userId = req.session.user._id

  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  userCartCount = req.session.cartCount



  if (req.session.user.addressAdded) {
    req.session.addressMssg = true
  } else {

    req.session.addressMssg = false
  }
  await userHelper.deleteAddress(req.body.userId, req.body.type).then(async () => {

    let address = await userHelper.getAllAddress(userId)

    let userAddress = address.address
    if (address.status == false) {
      req.session.addressErr = true
    } else {
      req.session.addressErr = false
    }

    hb.render('views/users/address.hbs', {
      layout: 'users/layout',
      userId: userId,
      "Messg": req.session.addressMssg,
      "addressErr": req.session.addressErr,
      address: userAddress,
      "loggIn": userLoggedIn,
      user: user,
      userCartCount: userCartCount
    }).then((renderHtml) => {
      res.send(renderHtml)
    })
  })
})

// ************** add new address ajax call *****************
router.get('/addNewAddress', verifyUserLogg, async (req, res, next) => {
  console.log("ajax call **************");
  await userHelper.getAllAddress(req.session.user._id).then((response) => {
    if (response.status == true) {
      if (response.address.length == 3) {
        res.send({
          addressLimit: true
        })
      } else {
        res.send({
          addressLimit: false
        })
      }
    } else {
      res.send({
        addressLimit: false
      })
    }
  })
})



// ************** add new address get *****************
router.get('/addNewAddress1', verifyUserLogg, (req, res, next) => {

  res.render('users/addNewAddress', {
    layout: 'users/layout',
  })

})

// ******************* add new address post ****************
router.post('/addNewAddress', verifyUserLogg, (req, res, next) => {

  console.log("/addNewAddress");
  console.log(req.body);
  userHelper.addAddress(req.body, req.session.user._id, req.body.addressType).then((response) => {
    if (response.status == true) {
      req.session.addressAdded = true
      res.redirect(`/viewProfile/:${req.session.user._id}/address`)
    } else {
      req.session.addressAdded = false
      res.redirect(`/viewProfile/:${req.session.user._id}/address`)
    }
  })

})

// *********** view profile details page ***********
router.get('/viewProfile/:id/profile', verifyUserLogg, async (req, res, next) => {

  console.log(req.params.id);
  // console.log(req.session.user);
  let userId = req.session.user._id
  let user = await userHelper.getUser(userId)
  console.log("*******");
  console.log(user);
  res.render('users/viewProfileDetails', {
    layout: 'users/layout',
    userId: userId,
    user: user
  })
})


// ***************** edit profile page get ******************
router.get('/viewProfile/:id/editProfile', verifyUserLogg, async (req, res, next) => {


  console.log("This is edit profile page");
  console.log(req.session.user);
  console.log(req.params.id);
  let userId = req.session.user._id
  let user = await userHelper.getUser(userId)
  res.render('users/editProfile', {
    layout: 'users/layout',
    user: user,
    userId: userId
  })
})

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/profileImages")
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})

var upload = multer({
  storage: storage
})

const imageUpload = upload.fields([{
  name: 'profile_photo',
  maxCount: 1
}]) // product image upload

//**************** edit profile post page ********************
router.post('/viewProfile/:id/editProfile', verifyUserLogg, (req, res, next) => {

  console.log("This is edit profile page");
  console.log();
  imageUpload(req, res, async (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res.req.body);
      console.log(Object.keys(req.files).length === 0);
      console.log(Object.keys(res.req.files).length === 0);

      if (Object.keys(res.req.files).length === 0) {
        var body = res.req.body
        var image = await userHelper.getImage(req.session.user._id)
        userHelper.editProfile(body, image, req.session.user._id).then(() => {
          res.redirect(`/viewProfile/:${req.session.user._id}/profile`)
        })
      } else {
        var body = res.req.body
        var image = req.files.profile_photo[0].filename
        console.log(image);
        userHelper.editProfile(body, image, req.session.user._id).then(() => {
          res.redirect(`/viewProfile/:${req.session.user._id}/profile`)
        })
      }
    }
  })
})

// ************* change password get page ************
router.get('/viewProfile/:id/changePassword', verifyUserLogg, (req, res, next) => {

  if (req.session.passChange == false) {
    passErr = true
  } else {
    passErr = false
  }
  res.render('users/changePassword', {
    layout: 'users/layout',
    passErr: passErr
  })
  req.session.passChange = true
})

//************** change password post ******************
router.post('/viewProfile/:id/changePassword', verifyUserLogg, (req, res, next) => {

  console.log(req.body);
  userHelper.changePass(req.session.user._id, req.body).then((response) => {
    if (response.status == true) {
      req.session.passChange = true
      res.redirect(`/viewProfile/:${req.session.user._id}/profile`)
    } else {
      req.session.passChange = false
      res.redirect(`/viewProfile/:${req.session.user._id}/changePassword`)
    }
  })
})


// ******* view all orders get *******************
router.get('/viewProfile/:id/orders', verifyUserLogg, async (req, res, next) => {

  user = req.session.user.userFirstName
  userLoggedIn = req.session.userLoggedIn
  console.log(req.params.id);
  let orders = await userProductHelper.getAllOrders(req.params.id)

  res.render('users/viewOrders1', {
    layout: 'users/layout',
    "loggIn": userLoggedIn,
    user: user,
    orders: orders
  })

})

// ******* cancel product from orders ************

router.post('/cancelProduct', (req, res, next) => {

  console.log(req.body);
  console.log("This is cancel order router");
  userProductHelper.cancelOrder(req.body)
  // userProductHelper.cancelTrail(req.body)
  res.send(status = true)
})

// *************** view products *************
router.get('/viewProducts', async (req, res, next) => {

  console.log(req.query.category)

  if (req.query.value === 'featured') {
    let products = await userProductHelper.getAllFeaturedSmartPhone()
    let value = 'Featured'
    console.log("******///")
    console.log(products);
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

  if(req.query.value === 'featuredLaptop'){
    let products = await userProductHelper.getAllFeaturedLaptop()
    let value = "Featured"
    res.render('users/productsView',{
     layout : 'users/layout',
     products : products,
     'value': value
    })
  }

  if(req.query.value === 'onSaleLaptop'){
    let products = await userProductHelper.getAllOnsaleLaptop()
    let value = "Featured"
    res.render('users/productsView',{
     layout : 'users/layout',
     products : products,
     'value': value
    })
  }

  if(req.query.value === 'topRatedLaptop'){
    let products = await userProductHelper.getAllTopRatedLaptop()
    let value = "Featured"
    res.render('users/productsView',{
     layout : 'users/layout',
     products : products,
     'value': value
    })
  }


  if (req.query.value === 'topRated') {
    let products = await userProductHelper.getAllTopRatedSmartPhone()
    let value = 'Top rated'
    console.log("******///")
    console.log(products);
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

  if (req.query.value === 'onSale') {
    let products = await userProductHelper.getAllOnsaleSmartPhone()
    let value = 'On sale'
    console.log("******///")
    console.log(products);
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

  if (req.query.category === 'brand') {
    let products = await userProductHelper.getBrandProduct(req.query.value)
    let value = req.query.value
    console.log("******///")
    console.log(products);
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

  if (req.query.category === 'laptop') {
    let products = await userProductHelper.getLaptopProduct(req.query.value)
    let value = req.query.value
    console.log("******///")
    console.log(products);
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

  if(req.query.value === 'offer'){
    let products = await userProductHelper.getOfferSmartphones()
    let value = req.query.category
    res.render('users/productsView', {
      layout: 'users/layout',
      products: products,
      'value': value
    })
  }

})

// ************ apply coupon ajax call **********
router.post('/applyCoupon', async (req, res, next) => {
  console.log("/applyCoupon");
  console.log(req.body);
  await userProductHelper.applyCoupon(req.body).then((response) => {
    console.log("*** apply coupon ******");
    console.log(response);

    if(response.userApplied == true){
      console.log(">>>>>>>>>>");
      res.send(response)
    }
    else{

      if (response.invalidCode == false) {      
        let oldAmount = req.session.totalAmount;
        response.totalAmount = req.session.totalAmount
        var discountPrice = response.totalAmount * (response.coupon.offer / 100)
        let sumTotal = response.totalAmount - parseInt(discountPrice)
        req.session.totalAmount = sumTotal
        req.session.coupon.Applied = true
        req.session.coupon.code = req.body.code
        console.log("**********************");
        console.log(req.session.totalAmount);
        console.log(req.session.coupon);
        response.totalAmount = oldAmount
        res.send(response)
      } 
      else {  
        response.totalAmount = req.session.totalAmount
        res.send(response)
      }
  
    }
    

  })
})

// *********** apply coupon count *********
router.get('/applyCouponCount',(req,res,next)  => {
  console.log(req.query);
  if(req.query.count == 1){
    res.send('success')
  }
  else{
    res.send('fail')
  }
})

// *********** product search ***************
router.post('/productSearch',async (req,res,next) => {
  console.log(req.body);
  if(req.body != null && req.body !== ''){
   let search = new RegExp(req.body.search, 'i')
   let products = await userProductHelper.searchProduct(search)
   console.log(products);
   if(products == null){
    req.session.searchErr = true
   }
   else{
    req.session.searchErr = false
  }
  res.render('users/search',{
    layout : 'users/layout',
    'searchErr' : req.session.searchErr,
    products : products
  })
  req.session.searchErr = false
  }
  else{
    res.redirect('/')
  }
})

// ******** sweet alert sample *************
router.get('/sweetAlert', (req, res, next) => {
  res.render('users/sweetAlertSample')
})

// router.post('/pay', (req, res) => {
//   const create_payment_json = {
//     "intent": "sale",
//     "payer": {
//         "payment_method": "paypal"
//     },
//     "redirect_urls": {
//         "return_url": "http://localhost:3000/success",
//         "cancel_url": "http://localhost:3000/cancel"
//     },
//     "transactions": [{
//         "item_list": {
//             "items": [{
//                 "name": "Red Sox Hat",
//                 "sku": "001",
//                 "price": "25.00",
//                 "currency": "USD",
//                 "quantity": 1
//             }]
//         },
//         "amount": {
//             "currency": "USD",
//             "total": "25.00"
//         },
//         "description": "Hat for the best team ever"
//     }]
// };

// paypal.payment.create(create_payment_json, function (error, payment) {
//   if (error) {
//       throw error;
//   } else {
//       for(let i = 0;i < payment.links.length;i++){
//         if(payment.links[i].rel === 'approval_url'){
//           res.redirect(payment.links[i].href);
//         }
//       }
//   }
// });

// });




module.exports = router;