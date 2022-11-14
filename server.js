const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('Uncaught Exception! Shutting down...');
  process.exit(1);
});

const app = require('./app.js');

const DB = process.env.MONGODB_CONNECTION_STRING.replace(
  '<password>',
  process.env.MONGODB_PASS
).replace('<username>', process.env.MONGODB_USERNAME);

mongoose.connect(DB).then(() => {
  console.log('Connection successfull');
});

const port = process.env.port || 4000;

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection! Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
