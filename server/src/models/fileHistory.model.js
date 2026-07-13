import mongoose from "mongoose";

const fileHistorySchema = new mongoose.Schema({
  fileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", required: true },
  content: { type: String, default: "" },
  savedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  summary: { type: String, default: "Auto-save" },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model("FileHistory", fileHistorySchema);
