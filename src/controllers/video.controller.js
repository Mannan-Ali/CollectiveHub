import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";
import uploadOnCloudinary from "../utils/cloudinary.js"


const getAllVideos = asynHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asynHandler(async (req, res) => {
    const { title, description } = req.body
    if (
        [title, description].some((field) =>
            field?.trim() === "")
    ) {
        throw new ApiError(400, "You missed some filed please fill them !!!")
    }
    // TODO: get video, upload to cloudinary, create video
    const owner = req.user?._id
    if (!owner) {
        throw new ApiError(400, "User is not logged in or does not exist")
    }
    const videoLocalPath = req.files?.videoFile[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400, "Video or Thumbnail are missing file is required")
    }
    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnailFile = await uploadOnCloudinary(thumbnailLocalPath);
    if (!videoFile || !thumbnailFile) {
        throw new ApiError(400, "video or thumnail is not sent to clooudinary")
    }
    const durationTime = videoFile.duration
    const video = await Video.create(
        {
            //check cloudinary.js for response.url and type 
            videoFile: videoFile.url,
            thumbnail: thumbnailFile.url,
            title: title.toLowerCase(),
            description,
            duration: durationTime,
            owner: owner,
        }
    )

    return res.status(201).json(
        new ApiResponse(200, video, "Video created Successfully!!!")
    )
})

const getVideoById = asynHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Need videoId!!")
    }
    //TODO: get video by id
    const video = await Video.findById(videoId);
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Follwing vidoe data was fetched")
        )
})

const updateVideo = asynHandler(async (req, res) => {
    const { videoId } = req.params
    const {title,description} = req.body

    if (!videoId) {
        throw new ApiError(400, "Need videoId!!")
    }
    //checing if video exists or not
    const checkVideoId = await Video.findById(videoId);
    if (!checkVideoId) {
        throw new ApiError(404, "No such vidoe exists")
    }
    //this is to make sure only the channel user can change the vidoe data 
    if (req.user?._id.toString() !== checkVideoId.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this video")
    }
    
    const thumbnailLocalFilePath = req.file?.path
    if(!thumbnailLocalFilePath){
        throw new ApiError(400,"file is not found")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
    if(!thumbnail){
        throw new ApiError(400,"file is not uploaded")
    }
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                description:description,
                title : title,
                thumbnail: thumbnail.url
            },
        },
        { new: true },
    )
    return res.status(200)
    .json(
        new ApiResponse(200, video, "Video file details have been Updated !!")
    )

})

const deleteVideo = asynHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asynHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}