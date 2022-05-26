const bcryptjs = require('bcryptjs');

const User = require('../models/user');

////////////////////////////////////////////////////////////////

const getLogin = (req, res) => {
    const errorMessage = req.flash('errorMessage')[0];
    res.status(200)
        .render('auth/login', {
            pageTitle: 'Login',
            errorMessage
        });
};

const getSignup = (req, res) => {
    const errorMessage = req.flash('errorMessage')[0];
    res.status(200)
        .render('auth/signup', {
            pageTitle: 'Signup',
            errorMessage
        });
}

const postLogin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ where: { email }})
        .then((user) => {
            console.log('user', user);
            if (!user) {
                req.flash('errorMessage', '錯誤的 Email 或 Password。')
                return res.redirect('/login');
            }
            bcryptjs
                .compare(password, user.password)
                .then((isMatch) => {
                    console.log('isMatch', isMatch);
                    if (isMatch) {
                        req.session.user = user;
                        req.session.isLogin = true;
                        return req.session.save((err) => {
                            console.log('postLogin - save session error: ', err);
                            res.redirect('/');
                        });
                    }
                    req.flash('errorMessage', '錯誤的 Email 或 Password。')
                    res.redirect('/login');
                })
                .catch((err) => {
                    return res.redirect('/login');
                })
        })
        .catch((err) => {
            console.log('login error:', err);
        });
};

const postSignup = (req, res) => {
    const { displayName, email, password } = req.body;
    User.findOne({ where: { email } })
        .then((user) => {
            if (user) {
                req.flash('errorMessage', '此帳號已存在！請使用其他 Email。')
                return res.redirect('/signup');
            } else {
                return bcryptjs.hash(password, 12)
                    .then((hashedPassword) => {
                        return User
                            .create({ displayName, email, password: hashedPassword })
                            .then((newUser) => {
                                return newUser.createCart();
                            })
                            .catch((err) => {
                                console.log('postSignup - newUser.carateCart error: ', err);
                            });
                    })
                    .catch((err) => {
                        console.log('create new user error: ', err);
                    })
            }
        })
        .then((result) => {
            res.redirect('/login');
        })
        .catch((err) => {
            console.log('signup_error', err);
        });
};

const postLogout = (req, res) => {
    req.session.destroy((err) => {
        res.redirect('/login')
    });
};

module.exports = {
    getLogin,
    getSignup,
    postLogin,
    postLogout,
    postSignup
};