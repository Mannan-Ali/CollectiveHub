import mongoose, { isValidObjectId } from "mongoose"
import {PlayList} from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asynHandler } from "../utils/asyncHandler.js";


const createPlaylist = asynHandler(async (req, res) => {
    const {name, description} = req.body

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