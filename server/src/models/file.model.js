import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    content: {
      type: String,

      default: "",
    },

    type: {
      type: String,

      enum: ["file", "folder"],

      required: true,
    },

    workspace: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Workspace",

      required: true,
    },

    parent: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "File",

      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const File = mongoose.model("File", fileSchema);

export default File;
