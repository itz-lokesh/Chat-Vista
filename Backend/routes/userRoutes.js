import express from "express";
import UserModel from "../models/userModel.js";
import {
  registerUser,
  authUser,
  allUsers,
} from "../controllers/userControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").get(protect, allUsers); // have to pass protect first , to get access of allUsers
router.route("/").post(registerUser);
router.post("/login", authUser);
router.get("/online-status", async (req, res) => {
  try {
    const users = await UserModel.find({}, "_id isOnline");
    // empty {} means all document of UserModel , we want only 2 things [_id and isOnline]
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to get online statuses", error });
  }
});

export default router;
