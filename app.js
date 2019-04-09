import uuidv1 from "uuid/v1";
import util from "util";
import express from "express";
import bodyParser from "body-parser";
const setTimeoutPromise = util.promisify(setTimeout);
const app = express();
app.use(bodyParser.json());

const PORT = 3000;
const VISIBILITY_TIMEOUT = 2000;

let queue = [];

/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: string
  */

app.post("/sendMessage", (req, res) => {
  const messageBody = req.body.messageBody;

  if (!messageBody) {
    res.status(400).send("Request body must include parameter: messageBody");
  }

  const message = {
    id: uuidv1(),
    messageBody: messageBody,
    pendingProcessing: false
  };

  queue.push(message);
  res.json({ id: message.id });
  console.log("TCL: /sendMessage", message);
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
      400: string
  */

app.get("/receiveMessages", (req, res) => {
  const unprocessedMessages = queue.filter(
    message => !message.pendingProcessing
  );
  if (unprocessedMessages.length > 0) {
    // Send unprocessed messages
    const messages = unprocessedMessages.map(message => ({
      id: message.id,
      messageBody: message.messageBody
    }));
    res.json(messages);

    // Change messages state to processing
    queue = unprocessedMessages.map(message => ({
      id: message.id,
      messageBody: message.messageBody,
      pendingProcessing: true
    }));

    // Start visibility timeout
    setTimeoutPromise(VISIBILITY_TIMEOUT, unprocessedMessages).then(
      unprocessedMessages => {
        if (queue.length > 0) {
          const updatedQueue = [];
          // Set update queue with messages set to unprocessed status
          unprocessedMessages.forEach(unprocessedMessage => {
            if (queue.find(message => message.id === unprocessedMessage.id)) {
              updatedQueue.push(unprocessedMessage);
            }
          });
          queue = updatedQueue;
          console.log("TCL: receiveMessages timeout => ", queue);
        }
      }
    );
  } else {
    res.status(400).send("No unprocessed messages in queue.");
  }
});

/* DELETE /deleteMessage
    summary: Deletes message in DB with messageId
    parameters: {id: string}
    responses:
      200: string
      400: string
*/

app.delete("/deleteMessage", (req, res) => {
  const deleteId = req.body.id;
  if (!deleteId) {
    res.status(400).send("Request body must include parameter: id");
  }

  queue = queue.filter(message => message.id != deleteId);

  res.send(`${deleteId} deleted.`);
});

/* GET /allMessages
    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [{id: string, messageBody: string, processingPending: string}]
*/

app.get("/allMessages", (req, res) => {
  res.json(queue);
});

app.listen(PORT, () => console.log(`Queue server listening on port ${PORT}!`));
