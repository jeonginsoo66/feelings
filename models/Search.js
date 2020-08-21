import mongoose from "mongoose";

const searchSchema = mongoose.Schema({
  search_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  search_record_content: {
    type: String,
  },
});
