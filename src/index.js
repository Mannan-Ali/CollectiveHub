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

/*
// import { DB_NAME } from './constants' for 1st way of db connection
//1] way 1 for db connection

// making the func and then calling it instead use self calling fucntion
// function connectDB(){}
// connectDB();

// (async ()=>{
//     try{
//         //here the format is URL and the name of the database you want 
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//         //here we will use on listner to check specifficly that is the express able to talk to databse
//         app.on("error",(error)=>{
//             console.log("ERROR : ",error);
//             throw error;  
//         })

//         //if no problem then do app.listen basic one 
//         app.listen(process.env.PORT,()=>{
//             console.log(`http://localhost:${process.env.PORT}`);
            
//         })

//     }catch(error){
//         console.log("Error : ", error);
//         throw error ;
//     }

// })()
*/
