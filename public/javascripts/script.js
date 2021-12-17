function addToCart(proId) {

    console.log("This is addtoacart");
    $.ajax({
        url: '/addToCart/' + proId,
        method: 'get',
        success: function (response) {
            if (response == true) {
                alert("Product added to cart")
            }
            else {
                if (confirm('Please login to continue')) {
                    window.location.href = "/login";
                }

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
            if(response){          
                Swal.fire('User Exist')             
            }
            else{
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
                if (confirm('Do you want to delete this product?')) {
                    var elements = $(result.renderHtml);
                    var found = $('#cart_table', elements);
                    var found2 = $('#total_cart', elements);
                    $('#cart_table').html(found)
                    $('#total_cart').html(found2)                   
                }
            }
        }
    })
}

function deleteProduct(userId, proId) {
    console.log(userId);
    console.log(proId);

    if (confirm('Do you want to delete this product from cart?')) {
        $.ajax({
            url: '/deleteProduct',
            method: 'post',
            data: {
                userId: userId,
                proId: proId
            },
            success: function (response) {
                if (response) {
                    alert("Product removed from cart!")
                    var elements = $(response.renderHtml);
                    var found = $('#cart_table', elements);
                    var found2 = $('#total_cart', elements);
                    $('#cart_table').html(found)
                    $('#total_cart').html(found2)
                }
            }
        })
    }
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
    

