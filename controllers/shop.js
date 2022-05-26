const Product = require('../models/product');

////////////////////////////////////////////////////////////////

const getIndex = (req, res) => {
    Product.findAll()
        .then((products) => {
            res.status(200)
                .render('index', {
                    products
                });
        })
        .catch((err) => {
            console.log('Product.findAll() error: ', err);
        })
};

const getCart = (req, res) => {
    req.user
        .getCart()
        .then((cart) => {
            return cart.getProducts()
                .then((products) => {
                    res.render('shop/cart', {
                        products,
                        amount: cart.amount
                    });
                })
                .catch((err) => {
                    console.log('getCart - cart.getProducts error: ', err);
                })
        })
        .catch((err) => {
            console.log('getCart - user.getCart error', err);
        })
};

const postCartAddItem = (req, res) => {
    const { productId } = req.body;
    let userCart;
    let newQuantity = 1;
    req.user
        .getCart()
        .then((cart) => {
            userCart = cart;
            // NOTE: 檢查 product 是否已在 cart
            return cart.getProducts({ where: { id: productId }});
        })
        .then((products) => {
            let product;
            if (products.length > 0) {
                // NOTE: 本來購物車就有的商品，所以數量必定大於 1
                product = products[0];
                const oldQuantity = product.cartItem.quantity;
                newQuantity = oldQuantity + 1;
                return product;
            }
            return Product.findByPk(productId);
        })
        .then((product) => {
            return userCart.addProduct(product, {
                through: { quantity: newQuantity }
            });
        })
        // NOT: 下面這段在處理 amount 總額
        .then(() => {
            return userCart.getProducts();
        })
        .then((products) => {
            const productsSums = products.map((product) => product.price * product.cartItem.quantity);
            const amount = productsSums.reduce((accumulator, currentValue) => accumulator + currentValue);
            userCart.amount = amount;
            return userCart.save();
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err) => {
            console.log('postCartAddItem error: ', err);
        })
};

const postCartDeleteItem = (req, res, next) => {
    const { productId } = req.body;
    let userCart;
    req.user
        .getCart()
        .then((cart) => {
            userCart = cart;
            return cart.getProducts({ where: { id: productId }});
        })
        .then((products) => {
            const product = products[0];
            return product.cartItem.destroy();
        })
        .then(() => {
            return userCart
                .getProducts()
                .then((products) => {
                    if (products.length) {
                        const productSums = products.map((product) => product.price * product.cartItem.quantity);
                        const amount = productSums.reduce((accumulator, currentValue) => accumulator + currentValue);
                        userCart.amount = amount;
                        return userCart.save();
                    }
                });
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err) => console.log(err));
};

module.exports = {
    getIndex,
    getCart,
    postCartAddItem,
    postCartDeleteItem,
};