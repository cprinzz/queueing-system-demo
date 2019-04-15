import util from "util";
import express from "express";
import bodyParser from "body-parser";
import Database from "./Database";
const setTimeoutPromise = util.promisify(setTimeout);
const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

const PORT = 5000;
const VISIBILITY_TIMEOUT = 2000;
const SUCCESS = "SUCCESS";
const ERROR = "ERROR";
const db = new Database();

/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: {status: string, msg: string}
  */

app.post("/sendMessage", (req, res) => {
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
});

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

app.get("/receiveMessages", (req, res) => {
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

/* DELETE /deleteMessage
    summary: Deletes message in DB with messageId
    parameters: {id: string}
    responses:
      200: {status: string, msg: string}
      400: {status: string, msg: string}
*/

app.delete("/deleteMessage", (req, res) => {
  const deleteId = req.body.id;
  if (!deleteId) {
    res
      .status(400)
      .json({ status: ERROR, msg: "Request body must include parameter: id" });
  }

  db.deleteMessage(deleteId);
  res.json({ status: SUCCESS, msg: `${deleteId} deleted.` });
});

/* GET /allMessages
    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [{id: string, messageBody: string, processingPending: string}]
*/

app.get("/allMessages", (req, res) => {
  res.json(db.getAllMessages());
});

app.listen(PORT, () => console.log(`Queue server listening on port ${PORT}!`));
export default app;
