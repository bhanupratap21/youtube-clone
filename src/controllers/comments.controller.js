import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlers } from "../utils/asyncHandlers.js";

const getVideoComments = asyncHandlers(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId) || !videoId) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "video not found");
  }

  const comments = Comment.aggregate([
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "videoDetails",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "ownerDetails",
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              ownerDetails: { $first: "$ownerDetails" },
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $lookup: {
              from: "videos",
              localField: "watchHistory",
              foreignField: "_id",
              as: "watchHistoryDetails",
            },
          },
          {
            $addFields: {
              watchHistoryDetails: { $first: "$watchHistoryDetails" },
            },
          },
        ],
      },
    },
  ]);

  const { page = 1, limit = 10 } = req.query;

  const options = {
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10,
  };

  const result = await Comment.aggregatePaginate(comments, options);

  if (!result) {
    throw new ApiError(404, "Error while fetching comments");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Comments fetched successfully"));
});

const addComment = asyncHandlers(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (content.trim() == "") {
    throw new ApiResponse(400, "comment cannot be empty");
  }

  if (!(await Video.findById(videoId))) {
    throw new ApiResponse(400, "video not found");
  }

  const comments = await Comment.create({
    comment: content,
    video: videoId,
    owner: req.user?._id,
  });

  if (!comments) {
    throw new ApiError(500, "Error while adding comment, Please try again");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, comments, "comment added successfully."));
});

const updateComment = asyncHandlers(async (req, res) => {
  const { commentId, videoId } = req.params;
  const { newContent } = req.body;

  if (!mongoose.isValidObjectId(commentId) || !commentId) {
    throw new ApiError(400, "Invalid comment id");
  }

  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new ApiError(400, "Commnet does not exit");
  }

  if (!(await Video.findById(videoId))) {
    throw new ApiError(400, "video does not exit,sorry");
  }

  if (comment?.owner.toString() !== req.user?._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this comment");
  }

  const updateComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      comment: newContent,
    },
    { new: true }
  );

  if (!updateComment) {
    throw new ApiError(500, "Error while updating comment, Please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updateComment, "Comment updated successfully"));
});

const deleteComment = asyncHandlers(async (req, res) => {
  
});

export { getVideoComments, addComment, updateComment, deleteComment };
