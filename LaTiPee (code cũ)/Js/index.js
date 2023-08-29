async function loadProducts() {
        try {
            const response = await fetch('http://localhost:3000/products');
            const products = await response.json();

            const productContainer = document.querySelector('.product .section');
            
            products.forEach(product => {
                const productElem = `
                    <div class="item-product">
                        <img src="/img/${product.imageURL}" alt="">
                        <div>
                            <h3 class="product-name">${product.name}</h3>
                            <h3 class="product-price">${product.price}đ</h3>
                        </div>
                    </div>
                `;
                productContainer.innerHTML += productElem;
            });
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    }
    window.onload = loadProducts;