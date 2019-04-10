import uuidv1 from 'uuid/v1';
import util from 'util';
import express from 'express';
import bodyParser from 'body-parser';
const setTimeoutPromise = util.promisify(setTimeout);
const app = express();
app.use(bodyParser.json());
app.use(function(req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  // Request methods you wish to allow
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  // Request headers you wish to allow
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With,content-type'
  );

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});

const PORT = 5000;
const VISIBILITY_TIMEOUT = 2000;
const SUCCESS = 'SUCCESS';
const ERROR = 'ERROR';

let queue = [];

/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: {status: string, msg: string}
  */

app.post('/sendMessage', (req, res) => {
  const messageBody = req.body.messageBody;

  if (!messageBody) {
    res.status(400).json({
      status: ERROR,
      msg: 'Request body must include parameter: messageBody'
    });
  }

  const message = {
    id: uuidv1(),
    messageBody: messageBody,
    pendingProcessing: false
  };

  queue.push(message);
  res.json({ id: message.id });
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
      400: {status: string, msg: string}
  */

app.get('/receiveMessages', (req, res) => {
  // Send unprocessed messages
  const unprocessedMessages = queue
    .filter(message => !message.pendingProcessing)
    .map(message => ({
      id: message.id,
      messageBody: message.messageBody
    }));
  res.json(unprocessedMessages);

  // Change messages state to processing
  queue = queue.map(message => ({
    id: message.id,
    messageBody: message.messageBody,
    pendingProcessing: true
  }));

  // Start visibility timeout
  setTimeoutPromise(VISIBILITY_TIMEOUT, unprocessedMessages).then(messages => {
    if (queue.length > 0) {
      // Update unprocessed messages to pendingProcessing = false if not deleted already
      unprocessedMessages.forEach(unprocessedMessage => {
        let i = queue.map(msg => msg.id).indexOf(unprocessedMessage.id);
        if (i !== -1) {
          queue[i] = { ...unprocessedMessage, pendingProcessing: false };
        }
      });
    }
  });
});

/* DELETE /deleteMessage
    summary: Deletes message in DB with messageId
    parameters: {id: string}
    responses:
      200: {status: string, msg: string}
      400: {status: string, msg: string}
*/

app.delete('/deleteMessage', (req, res) => {
  const deleteId = req.body.id;
  if (!deleteId) {
    res
      .status(400)
      .json({ status: ERROR, msg: 'Request body must include parameter: id' });
  }

  queue = queue.filter(message => message.id != deleteId);

  res.json({ status: SUCCESS, msg: `${deleteId} deleted.` });
});

/* GET /allMessages
    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [{id: string, messageBody: string, processingPending: string}]
*/

app.get('/allMessages', (req, res) => {
  res.json(queue);
});

app.listen(PORT, () => console.log(`Queue server listening on port ${PORT}!`));
