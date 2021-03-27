const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Global Uncought Exceptions, more for Asynchronous code
process.on('uncaughtException', (err) => {
    console.log(
        'UNCAUGHT EXCEPTION! Shutting down...'
    );
    console.log(err.name, err.message);
    process.exit(1);

    // Usually there is some method to restart the server so it does not just hang there forever in this state
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
);

mongoose
    .connect(DB, {
        // .connect(process.env.DATABASE_LOCAL, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        // .then((connection) => {
        // console.log(connection.connections);
        console.log('DB connection successful!');
    });

// console.log(app.get('env')); // developer - set be express
// // From: config.env file
// console.log(`NODE_ENV: ${process.env.NODE_ENV}`); // - set by node.js
// console.log(`PORT: ${process.env.PORT}`);
// console.log(`USERNAME: ${process.env.USERNAME}`);
// console.log(`PASSWORD: ${process.env.PASSWORD}`);

// To set developer envioronment => terminal =>

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});

// Global Unhandled Rejections, more for Synchronous code
process.on('unhandledRejection', (err) => {
    console.log(
        'UNHANDLED REJECTION! Shutting down...'
    );
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
    // Usually there is some method to restart the server so it does not just hang there forever in this state
});
