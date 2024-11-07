import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        userName : {
            type : String,
            required : [true, 'UserName  is required '],
            lowercase : true,
            unique : [true, 'Enter Unique name '],
            trim : true,
            index : true // makes it easy to search like if you know this data will be used 
            // for searching then do index true
        },
        email : {
            type : String,
            required : [true, 'email is required '],
            lowercase : true,
            unique : [true, 'Enter Unique name '],
            trim : true, // using this we can remove whitespace 
        },
        fullName : {
            type : String,
            required : [true, 'fullName is required '],
            trim : true,
        },
        avatar : {
            type : String, // using cloudniary url 
            required : true,
        },
        coverImage : {
            type : String, // using cloudniary url 
        },
        watchHistory : [ //this is array as we will keep adding this value 
            { 
                type : mongoose.Schema.Types.ObjectId,
                ref : "Video",
            }
        ],
        //challenge : how we will encrypt the password as in database there  should be encryption and 
        // real password to match
        password : {
            type : String,
            required : [true, 'Password is required ']
        },
        refreshToken : {
            type : String,
        }

    },
    { timestamps: true }
)

/*
what are we doing here is that 1 parameter is save there are more such 
paramerter like Update on,delete . Here we are telling when the db is going 
to save data just before that we need to perfom the follwing function 
Now the funcion shold not be ()=> anynomuos bcoz inside anynomyus func we cannot 
use this , it does not get reference to this so how will we access userSchema vallue 

async : as it takes tile 
next : as this is a middleware 
*/
userSchema.pre("save", async function (next){
    // without this the code will even encrypt when basics like avatar or name 
    //is changed hence it is important
    if(!this.isModified("password")) return next(); 
    //bcrypt.hash(this.password, 10) 10 is the total rounds 
    this.password = await bcrypt.hash(this.password, 10)
    next()
})
//now we encrptyed the password but the user on frontend will type 
// password in string form only so how to compare both- so we create a method isPasswordCorrect using mongoose
//BASIC SYMTAX FOR :  creating method is SchemaName.method.method_name
userSchema.method.isPasswordCorrect = async function
(password){
    return await bcrypt.compare(password,this.password)//one is password passed by user and other is encrypted one
}


/*
READ BELOW TOO
Now JWT is a bearer token ,that is , who ever has this token we will only send this data to them
what thing we will need : 
in env : 1. accesss_token_secret
         2. access_token_expiery
         3. refresh_token_ secret
         4. refresh_token_ expiry
Now refresh token will be stored in db thats why it is there in model 
but access token will not be stored ,we are ussing botn session and cookies so 

*/
userSchema.method.generateAccessToken = function(){
    jwt.sign(
        {
            _id : this._id,
            email : this.email,
            username : this.username,
            fullName : this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.method.generateRefreshToken = function(){
    jwt.sign(
        {
            _id : this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : ACCESS_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)

//REFREHS TOKEN AND ACCESS TOKEN 
/* 
What Are Access Tokens and Refresh Tokens?
Access Token: This is like a short-term pass that lets the user access the app. It contains basic user info, like ID and email, and has a short expiration time (often minutes or hours). It’s used to make requests to the server without logging in every time.

Refresh Token: This is like a longer-term pass that is only used to get a new access token when the current one expires. It contains minimal information, just enough to identify the user (like the user ID).


so if i close my browser and then repoen it in same app i might not need to login because of accesstoken or refeshtoken?

ChatGPT said:
ChatGPT
It depends on how the app handles tokens and where they are stored. Here’s a breakdown of how access tokens and refresh tokens work in relation to closing and reopening the browser:

1. Access Token:
Short-Lived: Access tokens usually have a short expiration time (like 15 minutes to an hour). They allow you to stay logged in for that duration as long as you don’t close the app or the browser.
Storage: If the access token is stored in memory (like in JavaScript variables) and you close the browser, you’ll likely lose that token. When you reopen the app, if the access token has expired, you’ll need to log in again.
2. Refresh Token:
Longer-Lived: Refresh tokens typically last much longer (sometimes days or weeks). They allow you to obtain a new access token without needing to log in again.
Storage: If the refresh token is stored securely (like in an HTTP-only cookie or local storage), it can persist even after you close the browser. If you reopen the app and your refresh token is still valid, the app can automatically request a new access token using the refresh token.
What Happens When You Reopen the Browser?
If Access Token is Still Valid: If you reopen the browser and the access token hasn’t expired, you can continue to use the app without logging in.

If Access Token Has Expired: If the access token is expired but the refresh token is still valid:

The app can use the refresh token to get a new access token automatically, allowing you to stay logged in without entering your username and password again.
If Both Tokens are Expired: If both the access token and the refresh token have expired, you’ll need to log in again to create a new set of tokens.

then why do we need refresh token we can make accesstoken for longer and then its done 
ChatGPT said:
ChatGPT
That’s a great question! While it might seem simpler to just use long-lived access tokens, there are several important reasons why using both access tokens and refresh tokens is a better practice for security and usability. Here’s a breakdown:

1. Security:
Short-Lived Access Tokens: Having short-lived access tokens minimizes the risk if an access token is compromised (e.g., intercepted by a hacker). If a token is valid for only a few minutes, its window of misuse is limited.
Refresh Tokens: They can have a longer lifespan because they are stored more securely and used less frequently. If a refresh token is compromised, you can revoke it without affecting all users’ access.
*/