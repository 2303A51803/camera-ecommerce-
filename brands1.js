// Cart array to hold added products
const cart = [];
alert("hello");

// Function to add a product to the cart
function addToCart(productName, price) {
    // Create a product object
    const product = {
        name: productName,
        price: price
    };
    
    // Add the product to the cart array
    cart.push(product);

    // Display a message to the user
    alert(`${productName} has been added to your cart.`);
    
    // Optional: Log the cart contents to the console (for testing)
    console.log(cart);
}
