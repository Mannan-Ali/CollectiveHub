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
            {
                $match:
                {
                    owner: mongoose.Types.ObjectId.createFromHexString(userId)
                }
            },
            {
                $project: {
                    name: 1,
                    description: 1,
                    //as we are returning size here thats why we will not returning array of video id
                    videosCount: { $size: "$video", },
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
    const playlist = await PlayList.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
        throw new ApiError(403, "Playlist not found or you are not authorized to modify it");
    }
    const getPlaylistById = await PlayList.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId.createFromHexString(playlistId),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "eachVideoDetail",
                pipeline: [
                    {//we will also need the userName just like youtube
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "ownerDetails",
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$ownerDetails" //here we are doing this because lookup will return an array even though owner is 1 only so getting the first element
                                //now this does not remove ownerFiled but what adds this that has exact same value as ownerFiled but not array 
                                //CHECK about.txt => 18.
                            }
                        }
                    },
                    {
                        $project: {
                            title: 1,
                            thuthumbnail: 1,
                            duration: 1,
                            owner: {
                                userName: 1,
                                avatar: 1,
                            }
                        }
                    }
                ]
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                eachVideoDetail: 1,
                owner: 1,
            }
        },
    ])
    if (!getPlaylistById) {
        throw new ApiError(400, "Error in this playlist")
    }
    //check the call in about.js very good eg 19.
    return res.status(200).json(
        new ApiResponse(200, getPlaylistById, "Playlists fetced successfully!!!")
    )

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
    const { playlistId } = req.params;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId is not valid");
    }
    const playlist = await PlayList.findOne({ _id: playlistId, owner: req.user._id });
    if (!playlist) {
        throw new ApiError(403, "Playlist not found or you are not authorized to modify it");
    }

    try {
        await PlayList.findByIdAndDelete(playlistId);

    } catch (error) {
        throw new ApiError(500, "Something went wrong while deleting playlist")
    }
    return res.status(200).json(
        new ApiResponse(200, playlist, " Playlist successfully deleted !!!")
    )
})

const updatePlaylist = asynHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "playlistId is not valid");
    }
    if (name.trim()==="") {
        throw new ApiError(400, "Playlist cannot exits without name!!!")
    }
    const updateplaylist = await PlayList.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id },
        { $set: { name:name , description:description} },        
        { new: true }
    );
    if(!updateplaylist){
        throw new ApiError(499, "You dont have such playlist")
    }
    return res.status(200).json(
        new ApiResponse(200, updateplaylist, " Playlist successfully updated !!!")
    )

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