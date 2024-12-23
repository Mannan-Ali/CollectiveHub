import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asynHandler(async (req, res) => {
    const { page = 1, limit = 10, query=" ", sortBy = "title", sortType = "asc", userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    /*steps:
    1. finding values with matching query 
    2.returning new doc with mmore info like vidoeFile,userName,fullName,etc.
    3.sorting the vidoes based on sorts
    4.pagination
    */
    const validatedPage = Number.isInteger(parseInt(page)) && parseInt(page) > 0 ? parseInt(page) : 1;
    const validatedLimit = Number.isInteger(parseInt(limit)) && parseInt(limit) > 0 ? parseInt(limit) : 10;

    // Calculate skip and limit values
    const skipValue = (validatedPage - 1) * validatedLimit;
    const limitValue = validatedLimit;

    const totalVideos = await Video.countDocuments({
        $or: [
            {
                title: { $regex: query, $options: "i" },
            },
            {
                description: { $regex: query, $options: "i" }
            }
        ]
    })

    if (skipValue >= totalVideos) {
        throw new ApiError(400, "Page Not found ")
    }
    const video = await Video.aggregate(
        [
            {
                //to find the vidoes with the searched query we first use match here
                $match: {
                    owner: mongoose.Types.ObjectId.isValid(userId)//as we are using createFromHexString we have to check first if the userId is valied 24 char hex if not then go to exits
                        ? mongoose.Types.ObjectId.createFromHexString(userId)  // If userId is provided, match specific owner
                        : { $exists: true },//if no userId is provided, we are looking for all documents where the owner field exists, regardless of the value of owner.

                    //or because we want to check accorss all the fields in the model for matching query 
                    $or: [
                        {
                            title: { $regex: query, $options: "i" },
                        },
                        {
                            description: { $regex: query, $options: "i" }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "users",//mongodb stores in small + s
                    localField: "owner",
                    foreignField: "_id",
                    as: "Owner",
                }
            },
            {
                $unwind: "$Owner",//the owner file comes in array form so here we are unwinding it 
            },
            {
                //what values we will need from the document
                $project: {
                    Owner: {
                        userName: 1,
                        fullName: 1,
                        coverImage: 1,
                    },
                    videoFile: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                }
            },
            {
                $sort: {
                    [sortBy]: sortType === "asc" ? 1 : -1,
                }
            },
            {
                $skip: skipValue,
            },
            {
                $limit: limitValue,
            }
        ]
    )

    return res.status(200)
    .json(new ApiResponse(200,video,"Vidoes successfully fetched"))
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
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    //TODO: get video by id
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(404, "No Video found")
    }
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Follwing vidoe data was fetched")
        )
})

const updateVideo = asynHandler(async (req, res) => {
    const { videoId } = req.params
    const { title, description } = req.body
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    if (!title || !description) {
        throw new ApiError(400, "Provide the necessary Inputs")
    }
    //checing if video exists or not
    const checkVideoId = await Video.findById(videoId);
    if (!checkVideoId) {
        throw new ApiError(404, "No such vidoe exists")
    }
    //this is to make sure only the channel user can change the vidoe data 
    if (req.user._id.toString() !== checkVideoId.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this video")
    }

    const thumbnailLocalFilePath = req.file?.path
    if (!thumbnailLocalFilePath) {
        throw new ApiError(400, "Thumbnail file is not found")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalFilePath);
    if (!thumbnail) {
        throw new ApiError(400, "file is not uploaded")
    }
    //we usually use this way when want to set multiple items together
    const video = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                description: description,
                title: title,
                thumbnail: thumbnail.url
            },
        },
        { new: true },
    )
    const deleteOldThumbnail = await deleteFromCloudinary(checkVideoId.thumbnail);
    if (deleteOldThumbnail.result !== "ok") {
        throw new ApiError(
            500,
            "Error while deleting old thumbnail from cloudinary"
        );
    }
    return res.status(200)
        .json(
            new ApiResponse(200, video, "Video file details have been Updated !!")
        )

})

const deleteVideo = asynHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID");
    }
    const video = await Video.findById(videoId);
    if (!video) {
        throw new ApiError(400, "No such Video exists!!")
    }
    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this video")
    }

    //TODO: delete video
    const deleteOldVideo = await deleteFromCloudinary(video.videoFile);
    if (deleteOldVideo.result !== "ok") {
        throw new ApiError(
            500,
            "Error while deleting old video from cloudinary"
        );
    }
    const deleteOldThumbnail = await deleteFromCloudinary(video.thumbnail);
    if (deleteOldThumbnail.result !== "ok") {
        throw new ApiError(
            500,
            "Error while deleting old video from cloudinary"
        );
    }
    const deleteVideoOject = await Video.findByIdAndDelete(videoId)
    if (!deleteVideoOject) {
        throw new ApiError(
            500,
            "Error while deleting old video file on Atlas"
        );
    }
    return res.status(200)
        .json(new ApiResponse(200, {}, "video data successfully deleted"))
})

const togglePublishStatus = asynHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "No such video exists")
    }
    if (req.user._id.toString() !== video.owner.toString()) {
        throw new ApiError(403, "You Not Owner of this video")
    }
    try {
        video.isPublished = !video.isPublished
        await video.save({ validateBeforeSave: false })
    } catch (error) {
        throw new ApiError(500, "Something went wrong while updating isPublish")
    }
    // const updatetogglePublish = await Video.findByIdAndUpdate(
    //     videoId,
    //     {
    //         $set: {
    //             isPublished : !video.isPublished
    //         },
    //     },
    //     { new: true },
    // )
    return res.status(200)
        .json(new ApiResponse(200, video, `Publishing was successfully set to ${video.isPublished}`))
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}



/*
req.params
Definition: Contains route parameters defined in the URL path of the route.

Purpose: Typically used for dynamic segments in the URL path to identify specific resources.

Access: Retrieved from the URL path, as defined in your route handler.

Example:

javascript
Copy code
app.get('/videos/:videoId', (req, res) => {
    console.log(req.params.videoId);
});
URL: http://example.com/videos/123
req.params: { videoId: '123' }
Use Case:

Retrieving a specific resource, like a video with a given videoId.

NOTE: req query is send after part of ? using key value in params in postman
req.query
Definition: Contains the query string parameters appended to the URL after the ?.

Purpose: Used for passing additional information to the server, like filters, sorting, or pagination details.

Access: Retrieved from the query string of the URL.

Example:

javascript
Copy code
app.get('/videos', (req, res) => {
    console.log(req.query.page); 
    console.log(req.query.limit);
});
URL: http://example.com/videos?page=1&limit=10
req.query: { page: '1', limit: '10' }
Use Case:

Filtering resources, like searching for videos with specific attributes, or defining options like page size for pagination.

*/