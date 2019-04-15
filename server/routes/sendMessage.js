import express from "express";
import db from "../Database";
import { ERROR } from "../constants";
const sendMessage = express.Router();

/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: {status: string, msg: string}
  */

sendMessage.post("/", (req, res, next) => {
  const messageBody = req.body.messageBody;

  if (!messageBody) {
    res.status(400).json({
      status: ERROR,
      msg: "Request body must include parameter: messageBody"
    });
  }
  const message = {
    messageBody: messageBody,
    pendingProcessing: false
  };

  const messageId = db.addMessage(message);
  res.json({ id: messageId });
  next();
});

export default sendMessage;
