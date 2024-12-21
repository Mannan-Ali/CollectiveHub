import mongoose from "mongoose";
//this is allows the owner of the channel or a user to tweet just like twitter and his follwers/subscriber can like those tweets ans stuff 
//for example the channel owner will have a video page , a tweeter page if he wants 
const tweetSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true })

export const Tweet = mongoose.model("Tweet", tweetSchema)