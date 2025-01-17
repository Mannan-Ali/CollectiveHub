import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    //here we dont do app.on as not in src/index.js
    console.log(
      `MongDB connection done!!!! :- DB HOST ${connectionInstance.connection.host}`
    );
    //this is to know on what host or server we got connected to
  } catch (error) {
    console.log("Mongo DB Connection error : ", error);
    process.exit(1); //read about this process and exit in js ,same as thorw error;
  }
};

export default connectDB;
