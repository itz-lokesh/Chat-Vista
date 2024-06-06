import express from "express";
import {
  allMessages,
  deleteMessage,
  sendMessage,
} from "../controllers/messageControllers.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/:chatId").get(protect, allMessages);
router.route("/").post(protect, sendMessage);
router.route("/delete").post(deleteMessage);

export default router;
