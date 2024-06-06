// userStatusUpdater.js
import UserModel from "../models/userModel.js"; // Adjust the path to your UserModel

async function updateUserOnlineStatus(userId, isOnline, io) {
  try {
    await UserModel.findByIdAndUpdate(userId, { isOnline: isOnline });
    console.log(`User ${userId} is ${isOnline ? "online" : "offline"}`);

    io.emit("statusChanged", { userId, isOnline });
  } catch (error) {
    console.error(`Failed to update user ${userId} status:`, error);
  }
}

export default updateUserOnlineStatus;
