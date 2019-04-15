import express from "express";
import db from "../Database";
const allMessages = express.Router();

/* GET /allMessages
    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [{id: string, messageBody: string, processingPending: string}]
*/

allMessages.get("/", (req, res) => {
  res.json(db.getAllMessages());
});

export default allMessages;
