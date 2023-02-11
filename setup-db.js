const {runMigrations} = require('./config/migration')

const options = {
    database: process.env.DATABASE_NAME || 'blogapplication',
    user: process.env.USERNAME || 'postgres',
    password: process.env.PASSWORD || 'Vantara@123',
    host: process.env.HOST || 'localhost',
    port: process.env.DBPORT || 5432,
}
runMigrations(options)

