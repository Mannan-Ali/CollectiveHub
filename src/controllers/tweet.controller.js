import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";


const createTweets = asynHandler(async (req, res) => {
    const { content } = req.body;

    if (content.trim() === "") {
        throw new ApiError(400, "You cannot have empty tweet!!!")
    }
    //no need to verify req.user._id as thats done in auth.middleware.js
    const tweet = await Tweet.create(
        {
            content: content,
            owner: req.user._id
        }

    )

    if (!tweet) {
        throw new ApiError(400, "Error Occured while creating the tweet");
    }
    return res.status(200)
        .json(new ApiResponse(200, tweet, "Tweet created successfully!!"))

})

const getUserTweets = asynHandler(async (req, res) => {
    const { userId } = req.params;
    if (!isValidObjectId(userId)) {
        throw new ApiError(404, "Enter valid userId")
    }
    const allTweets = await Tweet.aggregate([{ $match: { owner: mongoose.Types.ObjectId.createFromHexString(userId) } }])
    if (allTweets.length === 0) {
        throw new ApiError(404, "No Tweets for this user available.")
    }
    return res.status(200)
        .json(new ApiResponse(200, allTweets, "Tweets Fetched Successfully!!"))
})

const updateTweet = asynHandler(async (req, res) => {
    const { newContent } = req.body;
    if (newContent.trim() === "") {
        throw new ApiError(404, "Content cannot be empty")
    }
    const { tweetId } = req.params
    console.log(tweetId);
    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Enter valid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "No such Tweet exits!!")
    }
    if (req.user._id.toString() !== tweet?.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this tweet")
    }

    try {
        tweet.content = newContent;
        await tweet.save({ validateBeforeSave: false })
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating tweet")
    }
    return res.status(200)
        .json(new ApiResponse(200, tweet, "Tweet Updated Successfully"))
})

const deleteTweet = asynHandler(async (req, res) => {
    
    const { tweetId } = req.params
    console.log(tweetId);
    
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(404, "Enter valid tweet Id")
    }
    const tweet = await Tweet.findById(tweetId);

    if (!tweet) {
        throw new ApiError(404, "No such Tweet exits!!")
    }
    if (req.user._id.toString() !== tweet?.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this tweet")
    }
    try{
        await Tweet.findByIdAndDelete(tweetId);
    }catch (error) {
        throw new ApiError(500, "Something went wrong while deleting tweet")
    }
    return res.status(200)
        .json(new ApiResponse(200, "Tweet Deleted Successfully"))
})


export { createTweets, getUserTweets, updateTweet, deleteTweet };
