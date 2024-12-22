import mongoose, { isValidObjectId } from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";


const createPlaylist = asynHandler(async (req, res) => {
    const {name, description} = req.body;

    //Keeping description optional
    if(name.trim() === ""){
        throw new ApiError(400,"Playlist cannot exits without name!!!")
    }
    //here we are not adding video filed as user can create empty playlist then add video to it otherwise it might cause problems just like youtube
    //for now the videos will be empty array
    const playlist = await PlayList.create(
        {
            name : name,
            description : description,
            owner : req.user._id
        }
    )
    return res.status(200).json(
        new ApiResponse(200, playlist, "PlayList created Successfully!!!")
    )
})

// to display all playlists created by a specific user.
const getUserPlaylists = asynHandler(async (req, res) => {
    const {userId} = req.params

})
// to display all specific playlists. 
const getPlaylistById = asynHandler(async (req, res) => {
    const {playlistId} = req.params

})

const addVideoToPlaylist = asynHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
})

const removeVideoFromPlaylist = asynHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

})

const deletePlaylist = asynHandler(async (req, res) => {
    const {playlistId} = req.params
 
})

const updatePlaylist = asynHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body

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