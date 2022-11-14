const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../../config.env' });
const Tour = require('../../models/tourModel.js');
const fs = require('fs');

const DB = process.env.MONGODB_CONNECTION_STRING.replace(
  '<password>',
  process.env.MONGODB_PASS
).replace('<username>', process.env.MONGODB_USERNAME);

mongoose.connect(DB).then(() => {
  console.log('Connection successfull');
});

const tours = JSON.parse(fs.readFileSync('./tours-simple.json', 'utf-8'));

const importDataToDatabase = async () => {
  try {
    await Tour.create(tours);
    console.log('Data successfully loaded');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

const deleteAllDataFromCollection = async () => {
  try {
    await Tour.deleteMany();
    console.log('All data deleted successfully');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv.includes('--import')) {
  importDataToDatabase();
}

if (process.argv.includes('--delete')) {
  deleteAllDataFromCollection();
}
