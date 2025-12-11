// Product prices
//ADD ANY NEW PRIDUCT PRICES HERE!
var prices = {

    //Shirts
    redShirt: 22,
    blueShirt: 22,
    blackShirt: 20,
    greenShirt: 22,
    whiteShirt: 20,
    grayShirt: 18,

    //Hoodies
    whiteHoodie: 35,
    blackHoodie: 40,
    greenHoodie: 45,

    //Pants
    blackPants: 30,
    grayPants: 28,
    bluePants: 35,

    //Socks
    whiteSocks: 12,
    graySocks: 12,
    blackSocks: 12,
    grinchSocks: 16,

    //Shoes
    blackShoes: 170,
    brownShoes: 120,
    fishShoes: 10,

    //Hats
    blackBeanie: 15,
    blackFedora: 20,
    octopusHat: 20,

    //Sunglasses
    blackSunglasses: 300,
    redSunglasses: 20,
    peachSunglasses: 25,

};

// Product names (for display in the cart box)
//ADD ANY NEW PRODUCT DESCRIPTION HERE!
var productNames = {
    //Shirts
    redShirt: "Red Athletic Shirt",
    blueShirt: "Blue Athletic Shirt",
    blackShirt: "Black Athletic Shirt",
    greenShirt: "Green Athletic Shirt",
    whiteShirt: "White Athletic Shirt",
    grayShirt: "Gray Athletic Shirt",

    //Hoodies
    whiteHoodie: "White Hoodie",
    blackHoodie: "Black Hoodie",
    greenHoodie: "Green Hoodie",

    //Pants
    blackPants: "Black Athletic Pants",
    grayPants: "Gray Joggers",
    bluePants: "Blue Training Pants",

    //Socks
    whiteSocks: "White Socks",
    graySocks: "Gray Socks",
    blackSocks: "Black Socks",
    grinchSocks: "Grinch Socks",

    //Shoes
    blackShoes: "Black Shoes",
    brownShoes: "Brown Shoes",
    fishShoes: "Fish Shoes",

    //Hats
    blackBeanie: "Black Beanie",
    blackFedora: "Fit Fish Hat",
    octopusHat: "Octopus Hat",

    //Sunglasses
    blackSunglasses: "Black Sunglasses",
    redSunglasses: "Red Sunglasses",
    peachSunglasses: "Peach Fish Sunglasses",
};


//Inventory system

var defaultInventory = {
    redShirt: 100,
    blueShirt: 100,
    blackShirt: 100,
    greenShirt: 100,
    whiteShirt: 100,
    grayShirt: 100,

    whiteHoodie: 100,
    blackHoodie: 100,
    greenHoodie: 100,

    blackPants: 100,
    grayPants: 100,
    bluePants: 100,

    whiteSocks: 100,
    graySocks: 100,
    blackSocks: 100,
    grinchSocks: 100,

    blackShoes: 100,
    brownShoes: 100,
    fishShoes: 100,

    blackBeanie: 100,
    blackFedora: 100,
    octopusHat: 100,

    blackSunglasses: 100,
    redSunglasses: 100,
    peachSunglasses: 100
};

var inventory = {};
var storedInventory = localStorage.getItem("productInventory");
if (storedInventory) {
    inventory = JSON.parse(storedInventory);
} else {
    inventory = Object.assign({}, defaultInventory);
    localStorage.setItem("productInventory", JSON.stringify(inventory));
}

function loadInventoryFromDatabase() {
    if (typeof db === "undefined" || !db || !db.collection) {
        updateInventoryDisplay();
        return;
    }

    var inventoryRef = db.collection("inventory").doc("global");

    inventoryRef.get().then(function (doc) {
        if (doc.exists) {
            inventory = doc.data();
            localStorage.setItem("productInventory", JSON.stringify(inventory));
            updateInventoryDisplay();
        } else {
            inventoryRef.set(defaultInventory).then(function () {
                inventory = Object.assign({}, defaultInventory);
                localStorage.setItem("productInventory", JSON.stringify(inventory));
                updateInventoryDisplay();
            });
        }
    }).catch(function () {
        updateInventoryDisplay();
    });
}


function updateInventoryDisplay() {
    var elements = document.querySelectorAll("[data-product]");
    for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var name = el.getAttribute("data-product");
        var qty = inventory[name];
        if (typeof qty === "number") {
            el.textContent = "In stock: " + qty;
        }
    }
}



function getCartTotal() {
    var total = 0;
    for (var item in cart) {
        total += cart[item].subtotal;
    }
    return total;
}
// This is for the user's budget limit
let userBudget = 500.00;


// Cart data
var cart = {};

// Add to cart function
// Add to cart function
function addToCart(productName, buttonElement) {

    var price = prices[productName];

    // Quantity field
    var qtyInput = buttonElement.previousElementSibling;
    var qty = parseInt(qtyInput.value);

    if (qty < 1) {
        alert("Quantity must be at least 1.");
        return;
    }

    var currentQty = 0;
    if (cart[productName]) {
        currentQty = cart[productName].qty;
    }
    if (currentQty + qty > 5) {
        alert("Limit for this item is 5.");
        return;
    }

    var available = inventory[productName];
    if (typeof available === "number") {
        var cartQty = cart[productName] ? cart[productName].qty : 0;
        if (cartQty + qty > available) {
            var remaining = available - cartQty;
            if (remaining < 0) {
                remaining = 0;
            }
            alert("Not enough stock available. Only " + remaining + " left.");
            return;
        }
    }

    // Calculate new cost before adding
    var newItemCost = price * qty;
    var currentTotal = getCartTotal();
    var newTotal = currentTotal + newItemCost;

    // Verify user's budget
    if (newTotal > userBudget) {
        alert("Budget exceeded! Your limit is $" + userBudget);
        return;
    }

    // Add item to cart (or increase existing one)
    if (!cart[productName]) {
        cart[productName] = { qty: 0, subtotal: 0 };
    }

    cart[productName].qty += qty;
    cart[productName].subtotal = cart[productName].qty * price;

    updateCartDisplay();
}




// Update the cart box visually
function updateCartDisplay() {

    var cartList = document.getElementById("cart-items");
    var cartTotal = 0;

    // Clear old list
    cartList.innerHTML = "";

    // Build cart item list
    for (var item in cart) {
        var li = document.createElement("li");
        //cart format

        var textSpan = document.createElement("span");
        textSpan.textContent = productNames[item] + " (" + cart[item].qty + ") — $" + cart[item].subtotal;

        var removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.onclick = (function (product) {
            return function () {
                removeOneFromCart(product);
            };
        })(item);

        li.appendChild(textSpan);
        li.appendChild(removeButton);

        cartList.appendChild(li);

        cartTotal += cart[item].subtotal;
    }

    // Update total display
    document.getElementById("cart-total").textContent = cartTotal;

}
function removeOneFromCart(productName) {
    if (!cart[productName]) {
        return;
    }

    var price = prices[productName];

    cart[productName].qty -= 1;

    if (cart[productName].qty <= 0) {
        delete cart[productName];
    } else {
        cart[productName].subtotal = cart[productName].qty * price;
    }

    updateCartDisplay();
}


function clearCart() {
    cart = {};  // reset cart object


    // Reset cart display
    document.getElementById("cart-items").innerHTML = "";
    document.getElementById("cart-total").textContent = 0;

    // Reset quantity boxes
    document.querySelectorAll(".qty").forEach(q => q.value = 1);

}


//Scroll to top function
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    });
}


//function to send to checkout page
function goToCheckout() {
    // Send cart + total to next page
    localStorage.setItem("cartData", JSON.stringify(cart));
    localStorage.setItem("cartTotal", document.getElementById("cart-total").textContent);

    window.location.href = "checkout.html"; // Go to new page
}

loadInventoryFromDatabase();




