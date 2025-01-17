import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new mongoose.Schema(
  {
    videoFile: {
      type: String, //cloudinary url
      required: [true, "videoFile is required"],
    },

    thumbnail: {
      type: String,
      required: [true, "thumbnail is required"],
    },
    title: {
      type: String,
      required: [true, "title is required"],
    },
    description: {
      type: String,
      required: [true, "description  is required "],
    },
    duration: {
      // this we get from cloudinary as when it stores something
      // it returns time , url and stuff we will take it from there
      type: Number,
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);
//this is for as we cannot show all the viodes to user at once it has to load  :
//it gives from where till where the videos should be given
//we can only use Mongooseaggreagate with plugin
videoSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", videoSchema);
