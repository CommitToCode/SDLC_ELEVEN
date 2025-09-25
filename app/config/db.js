const mongoose = require("mongoose");

const db = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URL);
    if (db) {
      console.log("database connection successfull");
    }
  } catch (error) {
    console.log("database contection failed");
  }
};
module.exports = db;
