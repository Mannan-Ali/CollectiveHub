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
    const { videoId } = req.params;

    if (!data) {
        throw new ApiError(400, "Comment cannot be empty!!!");
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "videoId is not valid!!!")
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "The video you are trying to comment on does not exist!!!");
    }
    const comment = await Comment.create(
        {
            content: data,
            video: videoId,
            owner: req.user._id,
        }
    )
    if (!comment) {
        throw new ApiError(500, "Error while creating comment!!!")
    }
    return res.status(201).json(
        new ApiResponse(201, comment, "Comment created Successfully!!!")
    )
})

const updateComment = asynHandler(async (req, res) => {
    const { commentId } = req.params;
    const { updatedContent } = req.body;
    if (!updatedContent) {
        throw new ApiError(400, "The content cannot be left empty!!!")
    }
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "CommentId is not valid!!!")
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "No such comment found in database")
    }
    if (req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(403, "Only owner is allowed to modify comment")
    }
    const updateCommentData = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content: updatedContent
            },
        },
        { new: true },
    )
    return res.status(200)
        .json(new ApiResponse(200, updateCommentData, "comment successfully update!!!"))
})

const deleteComment = asynHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "CommentId is not valid!!!")
    }
    const comment = await Comment.findById(commentId);
    if (!comment) {
        throw new ApiError(404, "No such comment found in database")
    }
    if (req.user._id.toString() !== comment.owner.toString()) {
        throw new ApiError(403, "Only owner is allowed to delete comment")
    }
    const deleteCommentData = await Comment.findByIdAndDelete(commentId);
    return res.status(200)
        .json(new ApiResponse(200, deleteCommentData, "comment successfully deleted!!!"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}