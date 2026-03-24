import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subcription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandlers } from "../utils/asyncHandlers.js";

const toggleSubscription = asyncHandlers(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel ID");
  }

  const isSubscribed = await Subscription.findOne({
    channel: channelId,
    subscriber: req.user._id,
  });

  if (channelId == req.user._id) {
    throw new ApiError(400, "you can't subscribe your own channel");
  }

  if (!isSubscribed) {
    const subscribeChannel = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          subscribeChannel,
          "subscribed channel successfully."
        )
      );
  } else {
    const unsubscribe = await isSubscribed.deleteOne();

    return res
      .status(200)
      .json(
        new ApiResponse(200, unsubscribe, "channel unsubscribed successfully.")
      );
  }
});

const getUserChannelSubscriber = asyncHandlers(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel Id");
  }

  const subscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriberDetails",
      },
    },

    {
      $unwind: "$subscriberDetails",
    },

    {
      $project: {
        _id: 0,
        username: "$subscriberDetails.username",
        avatar: "$subscriberDetails.avatar",
      },
    },
  ]);

  if (!subscribers) {
    throw new ApiError(400, "Fetching Subscriber Failed");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribers,
        "Channel Subscribers fetched successfully"
      )
    );
});

const getSubscribedChannels = asyncHandlers(async (req, res) => {
  const { subscriberId } = req.params;
  const { limit = 10, page = 1 } = req.params;

  const subscribedChannel = Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "subscribedUserDetails",
        pipeline: [
          {
            $project: {
              fullName: 1,
              avatar: 1,
              username: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$subscribedUserDetails",
    },
    {
      //flatening the output for a cleaner API response
      $project: {
        _id: 0, //too many id's that the frontend don't need, so we exclude it
        channelId: "$subscribedUserDetails._id",
        fullName: "$subscribedUserDetails.fullName",
        username: "$subscribedUserDetails.username",
        avatar: "$subscribedUserDetails.avatar",
        subscribedAt: "$createdAt",
      },
    },
    {
      $sort: { subscribedAt: -1 },
    },
  ]);

  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
  };

  const paginatedSubscribeList = await Subscription.aggregatePaginate(
    subscribedChannel,
    options
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginatedSubscribeList,
        "Successfully fetched subscribed channels"
      )
    );
});

export { toggleSubscription, getUserChannelSubscriber, getSubscribedChannels };
