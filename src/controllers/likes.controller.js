import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.moldes.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js"

const toggleVideoLike = asynHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "VideoId is  not valid.")
    }
    try {
        const deleteVideoLike = await Like.findOneAndDelete({
            video: videoId,
            likedBy: req.user._id,
        });

        if (deleteVideoLike) {
            // If a videoLike was found and deleted
            return res.status(200)
                .json(new ApiResponse(200, deleteVideoLike, "Successfully unliked the video !!"))
        } else {
            // If no videoLike was found, create a new one (subscribe)
            const newVideoLike = await Like.create(
                {
                    video: videoId,
                    likedBy: req.user._id,
                }

            )
            return res.status(200)
                .json(new ApiResponse(201, newVideoLike, "Successfully liked the video"))
        }
    } catch (error) {
        throw new ApiError(500, error?.message, "Error while liking video.")
    }
})

const toggleCommentLike = asynHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "commentId is  not valid.")
    }
    try {
        const deleteCommentLike = await Like.findOneAndDelete({
            comment: commentId,
            likedBy: req.user._id,
        });

        if (deleteCommentLike) {
            // If a commentLike was found and deleted
            return res.status(200)
                .json(new ApiResponse(200, deleteCommentLike, "Successfully unliked the comment !!"))
        } else {
            // If no commentLike was found, create a new one (subscribe)
            const newCommentLike = await Like.create(
                {
                    comment: commentId,
                    likedBy: req.user._id,
                }
            )
            return res.status(200)
                .json(new ApiResponse(201, newCommentLike, "Successfully liked the comment"))
        }
    } catch (error) {
        throw new ApiError(500, error?.message, "Error while liking comment.")
    }

})

const toggleTweetLike = asynHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweetId is  not valid.")
    }
    try {
        const deleteTweetLike = await Like.findOneAndDelete({
            tweet: tweetId,
            likedBy: req.user._id,
        });

        if (deleteTweetLike) {
            // If a commentLike was found and deleted
            return res.status(200)
                .json(new ApiResponse(200, deleteTweetLike, "Successfully unliked the tweet !!"))
        } else {
            // If no commentLike was found, create a new one (subscribe)
            const newTweetLike = await Like.create(
                {
                    tweet: tweetId,
                    likedBy: req.user._id,
                }
            )
            return res.status(200)
                .json(new ApiResponse(201, newTweetLike, "Successfully liked the Tweet"))
        }
    } catch (error) {
        throw new ApiError(500, error?.message, "Error while liking tweet.")
    }
})

const getLikedVideos = asynHandler(async (req, res) => {
    //TODO: get all liked videos
    try {
        const allLikedVideos = await Like.aggregate([
            {
                $match: {
                    likedBy: req.user._id
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "likedVideos",
                    //read about.txt 20 for addField Info
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "ownerDetails",
                                pipeline: [
                                    {
                                        $project: {
                                            username: 1,
                                            fullName: 1,
                                            avatar: 1,
                                        }
                                    }
                                ]
                            }
                        },
                        {
                            $addFields: {
                                owner: {
                                    $first: "$ownerDetails",
                                },
                            },
                        },
                    ]
                }
            },
            {
                $unwind: "$likedVideos",
            },
            {
                $project: {
                    likedVideos: {
                        thumbnail: 1,
                        title: 1,
                        description: 1,
                        duration: 1,
                        owner:1,
                    },
                    createdAt: 1,
                }
            }
        ])
        return res.status(200)
            .json(new ApiResponse(200, allLikedVideos, "all liked videos!!"))

    } catch (error) {
        throw new ApiError(500, error?.message, "Error while returning allLikeVideos.")
    }
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}