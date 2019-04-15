import express from "express";
import db from "../Database";
import util from "util";
import { VISIBILITY_TIMEOUT } from "../constants";
const setTimeoutPromise = util.promisify(setTimeout);
const receiveMessages = express.Router();

/*  GET /receiveMessages
    summary: Pulls unprocessed messages from the DB, sends them to the consumer,
             sets the messages to Processing status, and sets a timeout to reset 
             the processing status if the message has not been deleted.
    parameters: None
    responses:
      200: {
        messages: [{
          id: string
          messageBody: string
        }]
      }
  */

receiveMessages.get("/", (req, res) => {
  // Send unprocessed messages and change messages state to processing
  const unprocessedMessages = db.getUnprocessedMessages();

  res.json(unprocessedMessages);

  setTimeoutPromise(VISIBILITY_TIMEOUT, unprocessedMessages).then(messages => {
    // Update unprocessed messages to pendingProcessing = false
    unprocessedMessages.forEach(message => {
      if (db.hasMessage(message.id)) {
        db.toggleMessageStatus(message.id);
      }
    });
  });
});

export default receiveMessages;
