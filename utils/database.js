const Sequelize = require('sequelize');

////////////////////////////////////////////////////////////

// database 是 Sequelize class 的實例(實體, instance) 
const database = new Sequelize('demo', 'root', '12345', {
    dialect: 'mysql', 
    host: 'localhost'
});

// const database = new Sequelize ('cart-demo', 'admin', 'admin', {
// 	dialect: 'mysql',
// 	host: '130.211.120.155'
// });

module.exports = database;