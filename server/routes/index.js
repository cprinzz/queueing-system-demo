import express from "express";
import sendMessage from "./sendMessage";
import deleteMessage from "./deleteMessage";
import receiveMessages from "./receiveMessages";
import allMessages from "./allMessages";

const router = express.Router();

router.use("/sendMessage", sendMessage);
router.use("/deleteMessage", deleteMessage);
router.use("/receiveMessages", receiveMessages);
router.use("/allMessages", allMessages);

export default router;
