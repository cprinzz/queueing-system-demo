const uuidv1 = require("uuid/v1");
const util = require("util");
const setTimeoutPromise = util.promisify(setTimeout);
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
const port = 3000;
const visibilityTimeout = 2000;

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
    const messages = unprocessedMessages.map(message => ({
      id: message.id,
      messageBody: message.messageBody
    }));
    queue = unprocessedMessages.map(message => ({
      id: message.id,
      messageBody: message.messageBody,
      pendingProcessing: true
    }));
    res.json(messages);
    console.log(queue);

    setTimeoutPromise(visibilityTimeout, unprocessedMessages).then(
      unprocessedMessages => {
        if (queue.length > 0) {
          const updatedQueue = [];
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

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
