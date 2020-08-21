import mongoose from "mongoose";

const musicSchema = mongoose.Schema({
  music_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  commontrack_id: {
    type: String,
    required: true,
  },
  album_id: {
    type: String,
    required: true,
  },
  artist_id: {
    type: String,
    required: true,
  },
  track_id: {
    type: String,
    required: true,
  },
  feelings_change: {
    type: String,
    trim: true,
  },
});

const Music = mongoose.model("music", musicSchema);

export default Music;
