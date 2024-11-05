/*
NOTE : IN THE FOLLWING FOLDER WE ARE JUST DEALING WITH HOW TO GET OR HALDLE THE FILE UPLOAD (AS FROM THE REQ.BODY AS EXPRESS DOES NOT DO THAT) IN THE LOCAL FILE THE CODE FOR UPLOAD IN CLOUDINARY IS iIN cloudinary.js
HERE WE WILL RECEIVE THE FILE -> LOCAL FILE (WHICH THEN WILL BE SEND TO CLOUDINARY FROM LOCAL FILES) -> CLOUDINARY (USING CLOUDINARY METHOD)
as before sending data to user or storing data in db what we need 
to some things we data so we will use multer as middleware
check documentaion of multer
we have already learned about middleware in appbewary check that out

we use to do is use middlware direclty in routes but as big project we will be 
making middleware in different files

we will be storing in disk not memory
*/
import multer from "multer";

//copied from multer github
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) //we are not going advance just saving whatever the file name is given
        // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        // cb(null, file.fieldname + '-' + uniqueSuffix) //giving our file its name (random) using callback;
    }
})

export const upload = multer({ storage: storage })

/*
1. the parameter file helps us configer the file,i.e , 
   in req body we handled the json data but to handle the file sending in body 
   we need this multer

2.cb is callback

3. the local file will be deleted in very short period of time 
*/

