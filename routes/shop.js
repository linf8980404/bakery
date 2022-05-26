const express = require('express');

const shopController = require('../controllers/shop');
const isLogin = require('../authGuard/isLogin');

////////////////////////////////////////////////////////////

const router = express.Router();

router.get('/', shopController.getIndex);
router.get('/cart', isLogin, shopController.getCart);
router.post('/cart-add-item', isLogin, shopController.postCartAddItem);
router.post('/cart-delete-item', isLogin, shopController.postCartDeleteItem);

module.exports = router;