// function addToCart(proId) {

//     console.log("This is addtoacart");
//     $.ajax({
//         url: '/addToCart/' + proId,
//         method: 'get',
//         success: function (response) {
//             console.log(response);
//             if (response.userStatus == true) {
//                 console.log(response);
//                 console.log('User exist')
//                 Swal.fire({
//                     position: 'center',
//                     icon: 'success',
//                     title: 'Produt added to cart',
//                     showConfirmButton: false,
//                     timer: 1000
//                 }).then(() => {
//                     var element = $(response.renderHtml)
//                     var fount = $('#cartCount', element)
//                     // var fount2 = $('#cartCountList', element)
//                     $('#cartCount').html(fount)
//                     console.log("Element fount");
//                     // console.log(response.renderHtml);
//                 })
//             } else {
//                 Swal.fire({
//                     title: 'Please login to continue!',
//                     icon: 'warning',
//                     showCancelButton: true,
//                     confirmButtonColor: '#42ba96',
//                     cancelButtonColor: '#d33',
//                     confirmButtonText: 'Login'
//                 }).then((result) => {
//                     if (result.isConfirmed) {
//                         location.href = '/login'
//                     }
//                 })

//             }
//         }
//     })
// }


function addToCart(proId) {

    console.log("This is addtoacart");
    $.ajax({
        url: '/addToCart/',
        method: 'post',
        data : {
            proId : proId
        },
        success: function (response) {
            console.log(response);
            if (response.userStatus == true) {
                console.log(response);
                console.log('User exist')
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Produt added to cart',
                    showConfirmButton: false,
                    timer: 1000
                }).then(() => {
                    var element = $(response.renderHtml)
                    var fount = $('#cartCount', element)
                    // var fount2 = $('#cartCountList', element)
                    $('#cartCount').html(fount)
                    console.log("Element fount");
                    // console.log(response.renderHtml);
                })
            } else {
                Swal.fire({
                    title: 'Please login to continue!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#42ba96',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Login'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.href = '/login'
                    }
                })

            }
        }
    })
}




function addToWishlist(proId) {

    console.log("This is addtoWishlist");

    $.ajax({
        url: '/addToWishlist/' + proId,
        method: 'get',
        success: function (response) {
            console.log(response);
            if (response.userExist) {
                if (response.status) {
                    Swal.fire({
                        position: 'center',
                        icon: 'success',
                        title: 'Produt added to Wishlist',
                        showConfirmButton: false,
                        timer: 1000
                    })
                } else {
                    Swal.fire({
                        position: 'center',
                        icon: 'warning',
                        title: 'Produt already exist in Wishlist!',
                        showConfirmButton: false,
                        timer: 1000
                    })
                }
            } else {
                Swal.fire({
                    title: 'Please login to continue!',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#42ba96',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Login'
                }).then((result) => {
                    if (result.isConfirmed) {
                        location.href = '/login'
                    }
                })
            }
        }

    })
}


// function changeQuantity(userId, proId, cartId, count) {
//     console.log(userId);
//     console.log(proId);
//     console.log(cartId);
//     console.log(count);

//     $.ajax({
//         url: '/changeQuantity',
//         method: 'post',
//         data: {
//             userId: userId,
//             proId: proId,
//             cartId: cartId,
//             count: count,

//         },
//         success: function (result) {
//             console.log("Entered");
//             console.log(result);
//             if (result.response.status) {
//                 if (result.response.inc) {
//                     var elements = $(result.renderHtml);
//                     var found = $('#cart_table', elements);
//                     var found2 = $('#total_cart', elements);
//                     $('#cart_table').html(found)
//                     $('#total_cart').html(found2)

//                 } else {

//                     var elements = $(result.renderHtml);
//                     var found = $('#cart_table', elements);
//                     var found2 = $('#total_cart', elements);
//                     $('#cart_table').html(found)
//                     $('#total_cart').html(found2)

//                 }

//             } else {
//                 Swal.fire({
//                     position: 'center',
//                     icon: 'error',
//                     title: 'Produt removed from Wishlist!',
//                     showConfirmButton: false,
//                     timer: 1500
//                 })
//                 var elements = $(result.renderHtml);
//                 var found = $('#cart_table', elements);
//                 var found2 = $('#total_cart', elements);
//                 $('#cart_table').html(found)
//                 $('#total_cart').html(found2)
//             }
//         }
//     })
// }

function changeQuantity(userId, proId, cartId, count) {
    console.log(userId);
    console.log(proId);
    console.log(cartId);
    console.log(count);

    $.ajax({
        url: '/changeQuantity',
        method: 'post',
        data: {
            userId: userId,
            proId: proId,
            cartId: cartId,
            count: count,

        },
        success: function (result) {
            console.log("Entered");
            console.log(result);
            if (result.response.status) {
                if (result.response.inc) {
                    var elements = $(result.renderHtml);
                    var found = $('#cart_table', elements);
                    var found2 = $('#total_cart', elements);
                    $('#cart_table').html(found)
                    $('#total_cart').html(found2)

                } else {
                    var elements = $(result.renderHtml);
                    var found = $('#cart_table', elements);
                    var found2 = $('#total_cart', elements);
                    $('#cart_table').html(found)
                    $('#total_cart').html(found2)
                }

            } else {
                Swal.fire({
                    title: 'Are you sure?',
                    text: "Do you want to delete the product!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Yes, delete it!'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire(
                            'Deleted!',
                            'Your file has been deleted.',
                            'success'
                        )
                    }
                }).then(() => {
                    var elements = $(result.renderHtml);
                    var found = $('#cart_table', elements);
                    var found2 = $('#total_cart', elements);
                    $('#cart_table').html(found)
                    $('#total_cart').html(found2)
                })
            }
        }
    })
}



function deleteProduct(userId, proId) {
    console.log(userId);
    console.log(proId);

    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Deleted!',
                'Your product has been deleted!',
                'success'
            ).then(() => {

                $.ajax({
                    url: '/deleteProduct',
                    method: 'post',
                    data: {
                        userId: userId,
                        proId: proId
                    },
                    success: function (response) {
                        if (response) {
                            var elements = $(response.renderHtml);
                            var found = $('#cart_table', elements);
                            var found2 = $('#total_cart', elements);
                            $('#cart_table').html(found)
                            $('#total_cart').html(found2)
                        }
                    }
                })

            })
        }
    })
}


function sweetAlert() {
    Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
    }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
            Swal.fire('Saved!', '', 'success')
        } else if (result.isDenied) {
            Swal.fire('Changes are not saved', '', 'info')
        }
    })
}

function removeFromWishlist(proId) {
    console.log("This is remove");

    $.ajax({
        url: '/removeWishlist',
        method: 'post',
        data: {
            proId: proId
        },
        success: function (response) {
            if (response) {
                var elements = $(response);
                var found = $('#wishlist_table', elements);
                $('#wishlist_table').html(found)
            }

        }
    })
}

function checkSave() {

    Swal.fire({
        title: 'Do you want to save the changes?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Save',
        denyButtonText: `Don't save`,
    })
}



function changeStatus(proId, value, orderId) {
    console.log(value, orderId, proId);

    $.ajax({
        url: '/admin/changeStatus',
        method: 'post',
        data: {
            value,
            orderId,
            proId
        },
        success: (renderHtml) => {

            var elements = $(renderHtml);
            var found = $('#myTable', elements);
            $('#myTable').html(found)
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Status changed!',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                location.reload()
            })
        },
        error: (err) => {
            console.log(err);
        }
    })
}

function cancelOrder(orderId) {

    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to delete this product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
    }).then(() => {
        $.ajax({
            url: '/admin/cancelProduct',
            method: 'post',
            data: {
                orderId: orderId,
                value: 'cancelled'
            },
            success: function () {

            }
        })
    })

}



function cancelProduct(orderId, proId) {
    // console.log(orderId,proId);
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you want to cancel this product?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel it!'
    }).then(() => {
        $.ajax({
            url: '/cancelProduct',
            method: 'post',
            data: {
                orderId: orderId,
                proId: proId
            },
            success: (response) => {
                if (response) {
                    location.reload()
                }
            }
        })
    })
}

// select address of billing details

async function selectAddress(value,userId){
    if(value == "other"){
        console.log("This is other");
        // document.getElementById('firstName').value = "jen"

        // const response = await fetch('/getOtherAddress',{
        //     method : 'post',
        //     body : JSON.stringify({
        //         value : value,
        //         userId : userId
        //     })
        // })
        // const data = await response.json()
        // console.log(data);
        $.ajax({
            url : '/getOtherAddress',
            method : 'post',
            data : {
                value : value,
                userId : userId
            },
            succcess : (response) => {
                
                console.log(JSON.parse(response))
                document.getElementById('firstName').value = response.userFname
                document.getElementById('lastName').value = response.userLname
                document.getElementById('address').value = response.homeAddress.address
                document.getElementById('state').value = response.homeAddress.state
                document.getElementById('district').value = response.homeAddress.district
                document.getElementById('city').value = response.homeAddress.city
                document.getElementById('postcode').value = response.homeAddress.postcode
                document.getElementById('emailAddress').value = response.homeAddress.email
                document.getElementById('phone').value = response.homeAddress.phone
            },
            error : () => {
                alert("Failed")
            }
        })

    }
    if(value == 'home'){
        console.log("This is home");
        $.ajax({
            url : '/getHomeAddress',
            method : 'post',
            data : {
                value : value,
                userId : userId
            },
            success : (response) => {
            console.log(response);
            document.getElementById('firstName').value = response.userFname
            document.getElementById('lastName').value = response.userLname
            document.getElementById('address').value = response.homeAddress.address
            document.getElementById('state').value = response.homeAddress.state
            document.getElementById('district').value = response.homeAddress.district
            document.getElementById('city').value = response.homeAddress.city
            document.getElementById('postcode').value = response.homeAddress.postcode
            document.getElementById('emailAddress').value = response.homeAddress.email
            document.getElementById('phone').value = response.homeAddress.phone
            }
        })

        

    }
     if(value === "office") {
        console.log("This is office");
        $.ajax({
            url : '/getOfficeAddress',
            method : 'post',
            data : {
                value : value,
                userId : userId
            },
            succcess : (response) => {
                alert('office route success')
                document.getElementById('firstName').value = response.userFname
                document.getElementById('lastName').value = response.userLname
                document.getElementById('address').value = response.homeAddress.address
                document.getElementById('state').value = response.homeAddress.state
                document.getElementById('district').value = response.homeAddress.district
                document.getElementById('city').value = response.homeAddress.city
                document.getElementById('postcode').value = response.homeAddress.postcode
                document.getElementById('emailAddress').value = response.homeAddress.email
                document.getElementById('phone').value = response.homeAddress.phone
            }
        })
        // document.getElementById('firstName').value = "bale"

    }
     
    console.log('Select address'+""+value)
}

function searchProduct(){

    onclick="searchProduct()"
    let search = document.getElementById('search').value
    console.log(search)
}