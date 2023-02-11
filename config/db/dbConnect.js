const Sequelize = require('sequelize');

const dbConnect = () => {
    try {
        return new Sequelize(process.env.DATABASE, process.env.USER, process.env.PASSWORD, {
            host: process.env.HOST,
            dialect:'postgres',
            pool: {
                max: 5,
                min: 0,
                idle: 1000
            }
        });
    }catch(err) {
        console.log('Error connecting db: ', {message: err.message, stack: err.stack})
    }
}

module.exports = dbConnect