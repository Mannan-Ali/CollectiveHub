/*
The controll file contains functionallity of 
as we dont have frontend we will be using postman 
*/
import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
//steps for register user :- 
//get user detail from frontend 
//we need everything from user defined in user db other than watchistory and refreshTOken
//validation for correct way of user sending data , not empty data is send
//check if user already exits : username and email (anyone is also okh)
//check for images ,check for avatar
//send/upload to cloudinary 
//create user object - then create entry in db
//remove password and refresh token filed from response as user cant know how encrypted pass and refesh look
//chcek user creation 
//return response

//get user detail from frontend
const registerUser = asynHandler(async (req, res) => {
    const { userName, fullName, email, password } = req.body
    console.log(email)
    //if empty 
    // if (fullName === " ") {
    //     return new ApiError(400,"Require fullName field")
    // }
    //better approach other than doing all ifs
    //some returns boolen value read on google
    if ([userName, fullName, email, password].some((field) => {
        return field.trim() === ""
    })) {
        throw new ApiError(400, "You missed some filed please fill them !!!")
    }

    //cheking if user exists : using user from model
    //$ this opeataor we can use insdie function like or and etc 
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if(existedUser) {
        throw new ApiError(409,"User with email or username already exits")
    } 

    //check for images ,check for avatar
    //req.files these files we get bcoz of multer its not from express 
    //the avatar is the one declared with same name in routes user
    //avatar[0] bcoz we are returnd an arrya kind and we only need the url or path that is the 1st valeu
    const avatarLocalPath = req.files?.avatar[0]?.path
    ///for cover image 
    const coverImageLocalPath = req.files?.coverImage[0]?.path
    //check if avatar is received
    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }
    //upload on cloudinary
    //we have wrote the basic code in cloudinary.js in utils
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    //checking again if avatar is send or not on db
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }
    const user = await User.create(
        {
            //check cloudinary.js for response.url and type 
            avatar : avatar.url,
            coverImage : coverImage?.url || "", //here what we are doing is checking if url not exits then let it be empty
            userName : userName.toLowerCase(),
            fullName ,
            email,
            password,
        }
    )
    //removing password and refreshtoken from response then check if user is empty or null or error or existed or not the if part here
    //this user._id is added by mongodb for uniqueness using this we can check if user exits 
    //now here inside select we give values that we dont want to go to user 
    //eveything is selected by default so we give what we dont want to go in response this could have been done with user also above 
    const SelectedChkUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    //check user creation
    if(!SelectedChkUser){
        throw new ApiError(500,"Something went to from server side!!!")
    }

    //return response : this is where we will use API response part from util
    //data part will contain all the data from here like fullname and stuff
    // the res.status part can be skipped but this is the standard way
    return res.status(201).json(
        //here what we wrote in apiresonponse would come if 
        //no such file was there that is basic way to standarized what all things we want the user to see
        new ApiResponse(200,SelectedChkUser,"User Registered Successfully!!!")
    )
})

export { registerUser }