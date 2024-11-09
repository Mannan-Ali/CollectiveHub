/*
The controll file contains functionallity of 
as we dont have frontend we will be using postman 
*/
import { asynHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import path from "path";
import jwt from "jsonwebtoken";

//creating method for access and refresh token which is used in loginUser
//here we are not useing asyncHandler bcoz no web request is made it us for this file only
const generateAccessANDRefreshToken = async (userID) => {
    try {
        const user = await User.findById(userID)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        //now we will send tokens to user 
        //before that we will also store refresh token inside db for refrence of user
        user.refreshToken = refreshToken;
        //now to save we need all the fields for the user but here we are only sending refreshToken so what we will do is 
        //not validate like direclty save inside the data
        await user.save({ validateBeforeSave: false })

        //seding to user
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Not able to Generate Tokens")
    }

}
//get user detail from frontend
const registerUser = asynHandler(async (req, res) => {
    //steps for register user :- 
    //get user detail from frontend 
    //we need everything from user defined in user db other than watchistory and refreshToken
    //validation for correct way of user sending data , not empty data is send
    //check if user already exits : username and email (anyone is also okh)
    //check for images ,check for avatar
    //send/upload to cloudinary 
    //create user object - then create entry in db
    //remove password and refresh token filed from response as user cant know how encrypted pass and refesh look
    //chcek user creation 
    //return response

    const { userName, fullName, email, password } = req.body
    //if empty 
    // if (fullName === " ") {
    //     return new ApiError(400,"Require fullName field")
    // }
    //better approach other than doing all ifs
    //some returns boolen value read on google
    if (
        [userName, fullName, email, password].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "You missed some filed please fill them !!!")
    }

    //cheking if user exists : using user from model
    //$ this opeataor we can use insdie function like or and etc 
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exits")
    }

    //check for images ,check for avatar
    //req.files these files we get bcoz of multer its not from express 
    //the avatar is the one declared with same name in routes user
    //avatar[0] bcoz we are returnd an arrya kind and we only need the url or path that is the 1st valeu
    const avatarLocalPath = req.files?.avatar[0]?.path;
    console.log(path.normalize(avatarLocalPath))
    ///for cover image 
    // const coverImageLocalPath = req.files?.coverImage[0]?.path
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }
    //check if avatar is received
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }
    //upload on cloudinary
    //we have wrote the basic code in cloudinary.js in utils
    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)



    //checking again if avatar is send or not on db
    if (!avatar) {
        throw new ApiError(400, "aaavatar file is required")
    }
    const user = await User.create(
        {
            //check cloudinary.js for response.url and type 
            avatar: avatar.url,
            coverImage: coverImage?.url || "", //here what we are doing is checking if url not exits then let it be empty
            userName: userName.toLowerCase(),
            fullName,
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
    if (!SelectedChkUser) {
        throw new ApiError(500, "Something went to from server side!!!")
    }

    //return response : this is where we will use API response part from util
    //data part will contain all the data from here like fullname and stuff
    // the res.status part can be skipped but this is the standard way
    return res.status(201).json(
        //here what we wrote in apiresonponse would come if 
        //no such file was there that is basic way to standarized what all things we want the user to see
        new ApiResponse(200, SelectedChkUser, "User Registered Successfully!!!")
    )
})

const loginUser = asynHandler(async (req, res) => {
    /*TODOS
    1. get data from req body
    2. (username or email) based accesss
    3. find the user if present 
    4. check password for login 
    5. if correct generate access and refresh Token
    6. send access and refresh in form of secure of cookies
    */
    const { userName, email, password } = req.body;

    //checking for anyone is provided or not
    //if you need only one like email remove username
    if (!userName && !email) {
        throw new ApiError(400, "Need Anyone of the Entries : UserName or Email")
    }
    //find the user on basis of req.body received
    //for anyone of this User.find({email}) do same in register
    const userInDB = await User.findOne(
        {
            $or: [{ userName }, { email }]
        }
    )
    if (!userInDB) {
        throw new ApiError(404, "User does not exits in DataBase")
    }
    //comapre the passowrds provied to db passowrd
    //already made isPasswordCorrect in User.Model.js
    //**NOTE : as me took instance inside userInDB so to access the methods that we created and is not universal  we use userInDB
    const ispasswordValid = await userInDB.isPasswordCorrect(password)
    if (!ispasswordValid) {
        throw new ApiError(401, "User does not exits in DataBase")
    }

    //if passoword is correct generate access token and refresh token 
    // go up in the file as we will use this files often we created methods for them

    const { accessToken, refreshToken } = await generateAccessANDRefreshToken(userInDB._id)

    //now we dont want user to have the encrpted password and refresh Token so 
    const loggedInUser = await User.findById(userInDB._id).select("-password -refreshToken")

    //sending user information in form of cookies
    //now to send in cookies form we need to set options (its an object)
    const options = {
        httpOnly: true,
        secure: true,
        //if this is not done anyone or the user can modify your cookies in browsser
        //but when this 2 are set true only the server can modify this cookies
        //not possible by frontend
    }
    //we are able to use this cookies as app.js has cookieparser 
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                //data field
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User Logged in Successfully"
            )
        )
})

const logOutUser = asynHandler(async (req, res) => {
    //1. reset the refreshToken in database to empty
    await User.findByIdAndUpdate(
        //what to update
        req.user._id,
        //to what 
        {
            $set: {
                refreshToken: null,
            }
        },
        {
            new: true
            //this way we are sending the new updated value that is refreshToken to undefined 
        }
    )
    //2. delete the secure cookies 
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
        .clearCookie("refreshToken", options)
        .clearCookie("accessToken", options)
        .json(
            new ApiResponse(200, {}, "User logged Out ")
        )

    //problem here how are we suppose to know delete user without refrence , and we cannot give form for this as 1. its not good and second user can any UserID and that will get deleted
    //solution : here we create our own middleware check middleware with name auth 
})

//when the refreshToken expires we will (checkNotebook) : controller for refreh access token 
const refreshAccessToken = asynHandler(async (req, res) => {
    const incomingRefrehToken = req.cookies.refreshToken || req.body.refreshToken // for mobile or postman
    if (!incomingRefrehToken) {
        throw new ApiError(401, "Unauthoriez request in refrehAccess Token")
    }
    //verify token
    /*
    //what we did here is passed specific users refrehToken and decoded it 
    //what actually happens is we have already send res with user unique id and also refrehToken
    //now we are verifying that 3 things
    hen you call jwt.verify, you are decrypting the token to see if it:

    Matches the expected format and signature (based on ACCESS_TOKEN_SECRET).
    Has a valid payload (the _id in this case).
    Is not expired.


    Correct, the verification part in this code does not directly involve the database. Here’s how it works:

    Verification Process: When you use jwt.verify, you’re verifying the token’s structure, signature, and expiration status based solely on the token itself and the secret key (ACCESS_TOKEN_SECRET). This step ensures:

    The token was issued by your server (because it was signed with your secret).

    The token validity (whether it's expired or not) is determined during the jwt.verify process. Here’s how that works:

    Expiration Check: When you created the token, you set an expiration time (expiresIn) in the token options. This expiration is embedded within the token's payload.

    jwt.verify Process: When jwt.verify is called on the token, the library automatically checks the current time against the expiration time inside the token:
    */
    try {
        const decodedToken = jwt.verify(
            incomingRefrehToken,
            process.env.ACCESS_TOKEN_SECRET
        )
        //Purpose: This check ensures that the user exists and has a legitimate record in the database, providing an additional security measure.
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid Refreh Token")
        }
        //comparing refrehTokens 
        if (incomingRefrehToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh Token is expired or used")
        }
        //genererate new tokens
        const { accessToken, refreshToken } = await generateAccessANDRefreshToken(user._id)
        console.log('accessToken:', accessToken);
        console.log('newrefreshToken:', refreshToken);

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { refreshToken, accessToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid RefreshToken")
    }


})

const changeCurrentPassowrd = asynHandler(async (req, res) => {
    //the user will enter this 2 filed on the frontend 
    //can also add confirm password
    const { oldPassword, newPassword } = req.body;
    // if(newPassword !== confPassword){
    //     throw new ApiError...
    // }
    //to do this user should be loged in and that can be checked with auth middlware
    //that is we can use here req.user
    const user = await User.findById(req.user?._id)//finding user in database
    if (!user) {
        throw new ApiError(404, "User does not exits in DataBase")
    }
    //we can check if the old password is correct or not the same way we do for login
    const checkOldPassword = await user.isPasswordCorrect(oldPassword)
    if (!checkOldPassword) {
        throw new ApiError(401, "Wrong Pasword Entered")
    }
    //this line will first call the pre so that the password is encrypted
    user.password = newPassword;
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Password is Updated !!")
        )
})

//this function is mainly used for dashbord or profile to load them faster
const getCurrentUser = asynHandler(async (req, res) => {
    return res.status(200)
        .json(200, req.user, "current user fetched successfully")
})
//to update user profile if he needs this is different from password as password usually have to be checked as it is sensitive 
//for avatar we can write another method because here just for image changing everthing will we resend 
const updateAccountDetails = asynHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "Both entities required !!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
            },
        },
        { new: true },
    ).select("-password") //we are directly applying select can also male selectedUser Like in 


    return res.status(200)
    .json(
        new ApiResponse(200,user,"Account Details Updataed Successfully")
    )
})
export { registerUser, loginUser, logOutUser, refreshAccessToken, changeCurrentPassowrd, getCurrentUser, updateAccountDetails }

//Access and Refresh token and why in cookies
/*
nd also when we can send in json return why are we sending cokkies?
ChatGPT said:
ChatGPT
Good question! Here’s why cookies are often preferred over sending tokens directly in the JSON response for storing sensitive tokens like access and refresh tokens:

1. Security:
HttpOnly Cookies: By sending tokens in cookies with the httpOnly flag set to true, we protect them from JavaScript access on the frontend. This reduces the risk of client-side attacks, such as Cross-Site Scripting (XSS), since JavaScript cannot access or manipulate httpOnly cookies.
Secure Flag: The secure flag ensures that cookies are only sent over HTTPS connections, further enhancing security.
2. Consistency Across Requests:
When tokens are stored in cookies, they automatically get included in each HTTP request to the server (for the same domain) without requiring explicit management in frontend code. This is particularly helpful when dealing with APIs because it simplifies how tokens are handled on the client side.
Cookies can also simplify handling requests to protected endpoints, as the client doesn’t need to include the token manually in every request (e.g., in headers).
3. Compliance and Best Practices:
Many applications, especially those that need to comply with security standards or regulations, favor cookies for sensitive tokens because they offer a more standardized way to control token access and enhance security.
When to Use JSON Instead of Cookies
In some cases, sending tokens directly in a JSON response is useful:

Single-Page Applications (SPAs) often handle tokens locally (in memory or local storage) for flexibility, particularly if they don’t rely on cookies for managing sessions.
Token Management: Sending tokens in JSON can be useful for SPAs needing fine-grained control over token renewal and storage, but this can expose tokens to client-side risks like XSS.


When both the access token and refresh token are stored in httpOnly cookies, the frontend doesn’t have direct access to these tokens. However, this setup allows the server and frontend to handle user authentication without requiring the user to re-enter their password each time a token expires. Here’s how it works:

1. Initial Login Request
When the user first logs in with their credentials (username and password), the server verifies the credentials and then generates an access token and a refresh token.
The server sends these tokens back as httpOnly cookies, which means the frontend can’t access them directly via JavaScript. However, these cookies are automatically included in all future HTTP requests to the server for the same domain.
2. Making Authenticated Requests
For each subsequent request, such as fetching user data or accessing a protected route, the browser automatically sends the httpOnly access token cookie along with the request.
The server checks this access token to verify if the user is authenticated. If the token is valid, the server processes the request and sends the data back.
*/


