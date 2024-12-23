import mongoose, { get, isValidObjectId } from "mongoose"
import { PlayList } from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";


const createPlaylist = asynHandler(async (req, res) => {
    const { name, description } = req.body;

    //Keeping description optional
    if (name.trim() === "") {
        throw new ApiError(400, "Playlist cannot exits without name!!!")
    }
    const existingPlaylist = await PlayList.findOne({
        $and: [{ name: name }, { owner: req.user._id }],
    });

    if (existingPlaylist) {
        throw new ApiError(400, "Playlist with this name already exists");
    }
    //here we are not adding video filed as user can create empty playlist then add video to it otherwise it might cause problems just like youtube
    //for now the videos will be empty array
    const playlist = await PlayList.create(
        {
            name: name,
            description: description,
            owner: req.user._id
        }
    )
    if (!playlist) {
        throw new ApiError(500, "Error while creating playlist");
    }
    return res.status(200).json(
        new ApiResponse(200, playlist, "PlayList created Successfully!!!")
    )
})

// to display all playlists created by a specific user.
const getUserPlaylists = asynHandler(async (req, res) => {
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "UserId is not valid")
    }
    const getUserPlaylists = await PlayList.aggregate(
        [
            { $match:
                { 
                    owner: mongoose.Types.ObjectId.createFromHexString(userId)
                }
            },
            {
                $project: {
                    name: 1,             
                    description: 1, 
                    //as we are returning size here thats why we will not returning array of video id
                    videosCount: { $size: "$video",},
                },
            },
        ]
    );
    if (!getUserPlaylists) {
        throw new ApiError(400, "User does not have any playlist")
    }
    return res.status(200).json(
        new ApiResponse(200, getUserPlaylists, "User Playlists fetced successfully!!!")
    )
})

// to display all specific playlists. 
const getPlaylistById = asynHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId is not valid");
    }

})

const addVideoToPlaylist = asynHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "playlistId or videoId is not valid");
    }

    // const playlist = await PlayList.findById(playlistId);
    // if (!playlist) {
    //     throw new ApiError(400, "No such playlist exits");
    // }
    // if (req.user._id.toString() !== playlist.owner.toString()) {
    //     throw new ApiError(403, "You cannot modify others playlist")
    // }
    //better way doing both together 
    const playlist = await PlayList.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
        throw new ApiError(403, "Playlist not found or you are not authorized to modify it");
    }
    // Replaced findById with exists for Video Validation:
    // Instead of fetching the entire video document, Video.exists() checks if the video exists more efficiently.
    // const getVideoDetails = await Video.findById(videoId);
    const videoExists = await Video.exists({ _id: videoId });
    if (!videoExists) {
        throw new ApiError(400, "No video with such id ");
    }
    const addVideoToPlaylist = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            //This operator ensures that the video ID is added only if it doesn’t already exist in the video array. If duplicates are not a concern
            $addToSet: { video: videoId }
        },
        { 
            new: true,////this way we are sending the new updated value
        },
    )
    if (!addVideoToPlaylist) {
        throw new ApiError(500, "Error while adding video to playlist");
    }
    return res.status(200).json(
        new ApiResponse(200, addVideoToPlaylist, " Video successfully added to  Playlists !!!")
    )
})

const removeVideoFromPlaylist = asynHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "playlistId or videoId is not valid");
    }
    const playlist = await PlayList.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
        throw new ApiError(403, "Playlist not found or you are not authorized to modify it");
    }

    const videoExists = await Video.exists({ _id: videoId });
    if (!videoExists) {
        throw new ApiError(400, "No video with such id ");
    }
    const addVideoToPlaylist = await PlayList.findByIdAndUpdate(
        playlistId,
        { 
            //This operator ensures that the video ID is added only if it doesn’t already exist in the video array. If duplicates are not a concern
            $pull: { video: videoId }
        },
        { 
            new: true,////this way we are sending the new updated value
        },
    )
    if (!addVideoToPlaylist) {
        throw new ApiError(500, "Error while deleting video to playlist");
    }
    return res.status(200).json(
        new ApiResponse(200, addVideoToPlaylist, " Video successfully deleted from Playlists !!!")
    )
})

const deletePlaylist = asynHandler(async (req, res) => {
    const { playlistId } = req.params

})

const updatePlaylist = asynHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}