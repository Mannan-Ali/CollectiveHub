import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asynHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asynHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "ChannelId not valid.");
  }
  try {
    // Attempt to delete the subscription (unsubscribe if it exists)
    const deletedSubscription = await Subscription.findOneAndDelete({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (deletedSubscription) {
      // If a subscription was found and deleted
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            deletedSubscription,
            "Unsubscribed successfully!!"
          )
        );
    } else {
      // If no subscription was found, create a new one (subscribe)
      const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(201, newSubscription, "Subscribed successfully!!")
        );
    }
  } catch (error) {
    throw new ApiError(500, error?.message, "Error while subscribing.");
  }
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asynHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "ChannelId not valid.");
  }
  //only allowing channel owner to access list of subscriber
  if (req.user._id.toString() !== channelId) {
    throw new ApiError(403, "Only owner can view subscribers list");
  }
  try {
    const channelSubscribers = await Subscription.aggregate([
      {
        $match: {
          channel: mongoose.Types.ObjectId.createFromHexString(channelId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "subscriber",
          foreignField: "_id",
          as: "Subscribers",
        },
      },
      {
        $unwind: "$Subscribers",
      },
      {
        $project: {
          createdAt: 1,
          Subscribers: {
            userName: 1,
            fullName: 1,
            coverImage: 1,
          },
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, channelSubscribers, "Total number of subscriber")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message,
      "Error while returning total number of subscriber."
    );
  }
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asynHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "subscriberId not valid.");
  }
  //only allowing channel owner to access list of subscriber
  if (req.user._id.toString() !== subscriberId) {
    throw new ApiError(403, "Only owner can view channels list");
  }
  try {
    const susbcriberChannels = await Subscription.aggregate([
      {
        $match: {
          subscriber: mongoose.Types.ObjectId.createFromHexString(subscriberId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "channel",
          foreignField: "_id",
          as: "Channels",
        },
      },
      {
        $unwind: "$Channels",
      },
      {
        $project: {
          Channels: {
            userName: 1,
            fullName: 1,
            avatar: 1,
          },
          createdAt: 1,
        },
      },
    ]);
    return res
      .status(200)
      .json(
        new ApiResponse(200, susbcriberChannels, "Total number of Channels")
      );
  } catch (error) {
    throw new ApiError(
      500,
      error?.message,
      "Error while returning total number of channels."
    );
  }
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
