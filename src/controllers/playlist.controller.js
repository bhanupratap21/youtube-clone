import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlers } from "../utils/asyncHandlers.js";

const createPlaylist = asyncHandlers(async (req, res) => {
    const { name, description } = req.body;

    if(!name){
        throw new ApiError(400,"Name is required")
    }

    const playlist = await Playlist.create({
      name,
      description: description || "",
      owner: req.user._id,
    });

    if (!playlist) {
      throw new ApiError(400, "Playlist Creation Failed");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist Created Successfully"));

});

export { createPlaylist };