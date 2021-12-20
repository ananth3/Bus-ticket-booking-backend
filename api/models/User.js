const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("User", UserSchema);
