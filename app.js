// 第一個區塊 內建模組
const path = require('path');

// 第二個區塊 第三方模組(套件)
const express = require('express');
const session = require('express-session');
const connectFlash = require('connect-flash');
const csrfProtection = require('csurf');
const bodyParser = require('body-parser');

// 第三個區塊 自建模組
const database = require('./utils/database');
const authRoutes = require('./routes/auth'); 
const shopRoutes = require('./routes/shop'); 
const errorRoutes = require('./routes/404');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

////////////////////////////////////////////////////////////////

const app = express();
const port = 3000;
const oneDay = 1000 * 60 * 60 * 24;

// middleware
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({ 
secret: 'my secret', 
resave: false, 
saveUninitialized: false,
cookie: {
    maxAge: oneDay,
}
})); 

app.use(connectFlash());
app.use(csrfProtection());

// NOTE: 取得 User model (如果已登入的話)
app.use((req, res, next) => {
if (!req.session.user) {
    return next();
}
User.findByPk(req.session.user.id)
    .then((user) => {
        req.user = user;
        next();
    })
    .catch((err) => {
        console.log('find user by session id error: ', err);
    })
});

app.use((req, res, next) => {
res.locals.pageTitle = '產品介紹';
res.locals.path = req.url;
res.locals.isLogin = req.session.isLogin || false;
res.locals.csrfToken = req.csrfToken();
next();
});

User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

app.use(authRoutes);
app.use(shopRoutes);
app.use(errorRoutes);

database
// .sync()
.sync({ force: true }) // 和 db 連線時，強制重設 db
.then((result) => {
    Product.bulkCreate(products);
    app.listen(port, () => {
        console.log(`Web Server is running on port ${port}`);
    });
})
.catch((err) => {
    console.log('create web server error: ', err);
});

const products = [
{
    title: '無麩質莓果堅果塔   單顆',
    price: 125,
    description: '充滿堅果香氣的堅果塔，採用蔓越莓乾、野生藍梅乾、杏仁果、核桃，與焦糖完美結合！',
    imageUrl: './images/1.png'
},
{
    title: '可可榛果脆餅   6片入',
    price: 220,
    description: '入口的瞬間，就能享受到濃郁及略帶苦甜的可可與榛果交織的浪漫的交響樂~',
    imageUrl: './images/2.png'
},
{
    title: '葡萄肉桂玉米脆餅   6片入',
    price: 220,
    description: '爽脆的玉米脆片搭配香甜葡萄乾再用些許肉桂點綴，讓人忍不住一口接一口!',
    imageUrl: './images/3.png'
},
{
    title: '草莓雪球       15顆',
    price: 250,
    description: '酸甜的草莓做成可愛的雪球造型，讓人愛不釋手!',
    imageUrl: './images/4.png'
},
{
    title: '宇治抹茶脆餅   6片入',
    price: 250,
    description: '一入口就能享受到自日本宇治空運到台的抹茶濃郁香氣和順滑口感！',
    imageUrl: './images/5.png'
},
{
    title: '原味杏仁脆餅   6片入',
    price: 220,
    description: '咬一口，清淡的杏仁香氣，隨著咬碎的餅乾，輕巧的滑入嘴裡',
    imageUrl: './images/6.png'
},
{
    title: '野生藍莓脆餅   6片入',
    price: 240,
    description: '酸甜交織的野生藍莓混合著豆乳香氣，為你在舌梢帶來迷人的驚喜',
    imageUrl: './images/7.png'
},
{
    title: '愛文芒果脆餅   6片入',
    price: 240,
    description: '愛文芒果的香氣交織著豆乳的濃郁，如同初戀般單純而美好!',
    imageUrl: './images/8.png'
},
{
    title: '杏仁檸檬脆餅   6片入',
    price: 240,
    description: '檸檬的微酸在口裡漸漸擴散，清爽層次搭配一杯茶是最好的午後饗宴!',
    imageUrl: './images/9.png'
},
];