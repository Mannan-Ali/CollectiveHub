// import 'dotenv/config'
import dotenv from "dotenv"
//we import it in the index.js file as soon as possible as we want the env variable to be avaiable to all the files and code
//imdediately so importing here at first is important
import express from 'express'
import connectDB from './db/index.js'

dotenv.config({path:'./env'})

console.log(process.env.PORT)
connectDB();

















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
