//variables
//cart
const cartButton = document.querySelector(".cart-btn");
const closeCartButton = document.querySelector(".close-cart");
const clearCartButton = document.querySelector(".clear-cart");
const buyNowButton = document.querySelector(".buy-now-btn");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");

//cart items
const cartItems = document.querySelector(".cart-items");
const cartContent = document.querySelector(".cart-content");
const cartTotal = document.querySelector(".cart-total");
const productsDOM = document.querySelector(".products-center");

let cart = [];

let buttonsDOM = [];


//get Products from products.json
class Products {
async getProducts() {
    try {
        //get items from the .json
        let result = await fetch("/resources/products.json");
        let data = await result.json();
        let productList = data.items;
        productList = productList.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
        });
        return productList;
    } catch (error) {
        console.log(error);
    }
    }
}

//displaying of products on the main page and the cart
class Displaying {
displayProducts(products) {
    let result = "";
    products.forEach((product) => {
    result += `
    <!--product-->
    <article class="product">
        <div class="img-container">
            <img src=${product.image} alt="${product.title}" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart">Comprar</i>
            </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
    </article>    
            `;
    });
    productsDOM.innerHTML=result;
}

getCartButton(){
    //take all products buttons and put them in an array
    const buttons = [...document.querySelectorAll(".bag-btn")];
    ;
    buttonsDOM = buttons;
    //check if the product has been already added to the cart and disable the button
    //if you want to add more products you can do it in the cart section
    buttons.forEach(button =>{
        let id= button.dataset.id;
        let inCart = cart.find(item =>item.id === id);
        if(inCart){
            button.innerHTML= "En el carrito";
            button.disabled = true;
        }
        button.addEventListener("click", (event)=>{
            event.target.innerHTML = "En el carrito";
            event.target.disabled = true;
            //get product that has the same id 
            let cartItem = {...Storage.getProduct(id), amount:1};
            //add and save the product to the cart
            cart = [...cart, cartItem];
            Storage.saveCart(cart);
            this.setCartValue(cart);
            this.addCartItem(cartItem);
            this.showCart();
        });        
    });
}
setCartValue(cart){
    let cartTot =0;
    let itemsTotal =0;
    cart.map(item=>{
        cartTot += item.price * item.amount;
        itemsTotal += item.amount
    })
    cartTotal.innerText = parseFloat(cartTot.toFixed(2));
    cartItems.innerText = itemsTotal;
}

addCartItem(item){
    const divider = document.createElement('div');
    divider.classList.add('cart-item');
    divider.innerHTML = `<img src=${item.image} alt="producto uno en carrito">
    <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>
            Quitar producto
        </span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount">${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
    </div>`
    cartContent.appendChild(divider);
}
showCart(){
    cartOverlay.classList.add('showCartInMainPage');
    cartDOM.classList.add('showCart');
}
hideCart(){
    cartOverlay.classList.remove('showCartInMainPage');
    cartDOM.classList.remove('showCart');
}
setupApp(){
    //checks if cart is empty or not
    //and fills the cart even if I refresh the page
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populate(cart);
    cartButton.addEventListener('click', this.showCart);
    closeCartButton.addEventListener('click', this.hideCart);
    this.cartLogic();
}
populate(cart){
    cart.forEach(item =>this.addCartItem(item));
}
//@@@ CART LOGIC 
cartLogic(){
    clearCartButton.addEventListener('click', ()=>{
        this.clearCart();
        Toastify({
            text: "Usted ha borrado todos los elementos de su carrito.",
            duration: 3000,
            close: true,
            gravity: "top",
            position: "center",
            stopOnFocus: true,
            style: {
            background: "linear-gradient(to right, #442bc1, #96c93d)",
            },
        }).showToast();
    });
    buyNowButton.addEventListener('click', ()=>{
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true
        })

        swalWithBootstrapButtons.fire({
            title: 'Desea confirmar su compra?',
            text: "Haga click para continuar",
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Si, confirmar.',
            cancelButtonText: 'No, cancelar.',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
            swalWithBootstrapButtons.fire(
                'Orden confirmada!',
                'Gracias por comprar en FULBO.',
                'success'
            )
            } else if (
              /* Read more about handling dismissals below */
                result.dismiss === Swal.DismissReason.cancel
            ) {
            swalWithBootstrapButtons.fire(
                'Compra cancelada.',
                'Ojalá puedas volver. Te esperamos.',
                'error'
            )
            }
        })
    });
    //cart functionality
    cartContent.addEventListener('click', event => {
        //remove item
        if (event.target.classList.contains("remove-item")) {
            let removeItem = event.target;
            let id = removeItem.dataset.id;
            cartContent.removeChild (removeItem.parentElement.parentElement);
            this.removeItem(id);
        }
        //increase the quantity of a product in my cart
        else if(event.target.classList.contains ("fa-chevron-up")){
            let addAmount = event.target;
            let id = addAmount.dataset.id;
            let tempItem = cart.find(item=> item.id ===id);
            tempItem.amount = tempItem.amount + 1;
            Storage.saveCart(cart);
            this.setCartValue(cart);
            addAmount.nextElementSibling.innerText = tempItem.amount;
        }
        else if(event.target.classList.contains("fa-chevron-down")){
            let lowerAmount = event.target;
            let id = lowerAmount.dataset.id;
            let tempItem = cart.find(item=> item.id ===id);
            tempItem.amount = tempItem.amount - 1;
            if(tempItem.amount > 0){
                Storage.saveCart(cart);
                this.setCartValue(cart);
                lowerAmount.previousElementSibling.innerText = tempItem.amount;
            }else{
                cartContent.removeChild(lowerAmount.parentElement.parentElement);
                this.removeItem(id);
            }
        }
    })
}
clearCart(){
    //for each id that's in the cart, 
    //remove product with the same id from the cart
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    //remove the product from the DOM
    while(cartContent.children.length > 0){
        cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
    
}
removeItem(id){
    cart=cart.filter(item=> item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Comprar`;
}
getSingleButton(id){
    return buttonsDOM.find(button => button.dataset.id === id);
}

}

//keep cart and main page data at localStorage
class Storage {
    static saveProducts(products){
        localStorage.setItem("products", JSON.stringify(products));
    };
    static getProduct(id){
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id)
    }
    static saveCart(cart){
        localStorage.setItem("cart", JSON.stringify(cart));
    }
    static getCart(){
        //if the cart exists, return it. if not, show an empty array
        return localStorage.getItem('cart')?JSON.parse(localStorage.getItem('cart')):[]
    }
}

document.addEventListener("DOMContentLoaded", () => {
const displaying = new Displaying();
const products = new Products();
    //setup application
    displaying.setupApp();
    //get all products
    products
    .getProducts()
    .then((products) => {
        displaying.displayProducts(products);
        Storage.saveProducts(products);
    }).then(()=>{
        displaying.getCartButton();
    });
});


