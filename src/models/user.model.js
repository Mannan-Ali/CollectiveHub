import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
        username : {
            type : String,
            required : [true, 'UserName  is required '],
            lowercase : true,
            unique : [true, 'Enter Unique name '],
            trim : true,
            index : true // makes it easy to search like if you know this data will be used 
            // for searching then do index true
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
    { timestamps: true })

    export const Video = mongoose.model("Video", videoSchema)