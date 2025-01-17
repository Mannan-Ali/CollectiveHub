import "dotenv/config";
//we import it in the index.js file as soon as possible as we want the env variable to be avaiable to all the files and code
//imdediately so importing here at first is important
import connectDB from "./db/index.js";
import { app } from "./app.js";

// Now when call this function its asyncronus so we also get promise in retun
//so using that we can call the app function
connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {});
    //here we will use on listner to check specifficly that is the express able to talk to databse
    app.on("error", (error) => {
      console.log("ERROR : ", error);
      throw error;
    });
  })
  .catch((error) => {
    console.log("Mongo DB error Occured : ", error);
  });


