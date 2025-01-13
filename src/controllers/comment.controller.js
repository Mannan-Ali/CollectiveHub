import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { Comment } from "../models/comment.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js"

const getVideoComments = asynHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params
    const { page = 1, limit = 10 } = req.query

})

const addComment = asynHandler(async (req, res) => {
    const { data } = req.body;
    const {videoId} = req.params;

    if(!data){
        throw new ApiError(400,"Comment cannot be empty!!!");
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"videoId is not valid!!!")
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(400,"The video you are trying to comment on does not exist!!!");
    }
    const comment = await Comment.create(
        {
            content: data,
            video: videoId,
            owner: req.user._id,
        }
    )
    if(!comment){
        throw new ApiError(500,"Error while creating comment!!!")
    }
    return res.status(201).json(
        new ApiResponse(201, comment, "Comment created Successfully!!!")
    )
})

const updateComment = asynHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asynHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}