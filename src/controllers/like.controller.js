import mongoose from "mongoose";
import { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlers } from "../utils/asyncHandlers.js";

const toggleVideoLike = asyncHandlers(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?._id;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const isLiked = await Like.findOne({
    video: videoId,
    likedBy: userId,
  });

  if (!isLiked) {
    const like = await Like.create({
      video: videoId,
      likedBy: userId,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "Liked the video successfully"));
  } else {
    const dislike = await Like.findByIdAndDelete(isLiked?._id);

    return res
      .status(200)
      .json(new ApiResponse(200, dislike, "Unlike the video successfully."));
  }
});

const toogleCommentLike = asyncHandlers(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment Id");
  }

  const isLiked = await Like.findOne({
    comment: commentId,
    likedBy: req.user._id,
  });

  if (!isLiked) {
    const like = await Like.create({
      comment: commentId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "comment like successfully."));
  } else {
    const dislike = await Like.findByIdAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, dislike, "comment dislike successfully."));
  }
});

const toggleTweetLike = asyncHandlers(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    return ApiError(400, "Invalid tweet Id");
  }

  const isLiked = await Like.findOne({ tweet: tweetId, likedBy: req.user._id });

  if (!isLiked) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: req.user._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, like, "tweet like Successfully"));
  } else {
    const dislike = await Like.findOneAndDelete(isLiked._id);

    return res
      .status(200)
      .json(new ApiResponse(200, dislike, "tweet dislike successfully"));
  }
});

const getLikedVideos = asyncHandlers(async (req, res) => {

    const likedVideos = await Like.aggregate([
      {
        $match: {
          likedBy: new mongoose.Types.ObjectId(req.user._id),
          video: {
            $exists: true,
          },
        },
      },

      {
        $lookup: {
          from: "videos",
          localField: "video",
          foreignField: "_id",
          as: "videoDetails",
        },
      },

      {
        $lookup: {
          from: "users",
          localField: "likedBy",
          foreignField: "_id",
          as: "channel",
        },
      },

      {
        $unwind: "$videoDetails",
      },

      {
        $project: {
          likedAt: "$createdAt",
          videoDetails: 1,
          channel: {
            username: {
              $getField: {
                field: "username",
                input: { $arrayElemAt: ["$channel", 0] },
              },
            },
            avatar: {
              $getField: {
                field: "avatar",
                input: { $arrayElemAt: ["$channel", 0] },
              },
            },
          },
        },
      },

    ]);

     if (!likedVideos) {
       throw new ApiError(400, "Liked Videos Fetching Failed");
     }

     return res
       .status(200)
       .json(new ApiResponse(200, likedVideos, "All Liked Videos"));
})

export { toggleVideoLike, toogleCommentLike, toggleTweetLike, getLikedVideos };
