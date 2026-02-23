const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  roomId: { type: String, unique: true },
  code: { type: String },
});

const Room = mongoose.model("Room", RoomSchema);

module.exports = Room;
