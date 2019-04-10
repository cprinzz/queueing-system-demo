"use strict";

var _v = _interopRequireDefault(require("uuid/v1"));

var _util = _interopRequireDefault(require("util"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var setTimeoutPromise = _util.default.promisify(setTimeout);

var app = (0, _express.default)();
app.use(_bodyParser.default.json());
app.use(function (req, res, next) {
  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Request methods you wish to allow

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); // Request headers you wish to allow

  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type'); // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)

  res.setHeader('Access-Control-Allow-Credentials', true); // Pass to next layer of middleware

  next();
});
var PORT = 5000;
var VISIBILITY_TIMEOUT = 2000;
var SUCCESS = 'SUCCESS';
var ERROR = 'ERROR';
var queue = [];
/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: {status: string, msg: string}
  */

app.post('/sendMessage', function (req, res) {
  var messageBody = req.body.messageBody;

  if (!messageBody) {
    res.status(400).json({
      status: ERROR,
      msg: 'Request body must include parameter: messageBody'
    });
  }

  var message = {
    id: (0, _v.default)(),
    messageBody: messageBody,
    pendingProcessing: false
  };
  queue.push(message);
  res.json({
    id: message.id
  });
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

app.get('/receiveMessages', function (req, res) {
  // Send unprocessed messages
  var unprocessedMessages = queue.filter(function (message) {
    return !message.pendingProcessing;
  }).map(function (message) {
    return {
      id: message.id,
      messageBody: message.messageBody
    };
  });
  res.json(unprocessedMessages); // Change messages state to processing

  queue = queue.map(function (message) {
    return {
      id: message.id,
      messageBody: message.messageBody,
      pendingProcessing: true
    };
  }); // Start visibility timeout

  setTimeoutPromise(VISIBILITY_TIMEOUT, unprocessedMessages).then(function (messages) {
    if (queue.length > 0) {
      // Update unprocessed messages to pendingProcessing = false if not deleted already
      unprocessedMessages.forEach(function (unprocessedMessage) {
        var i = queue.map(function (msg) {
          return msg.id;
        }).indexOf(unprocessedMessage.id);
        console.log('TCL: i', i);

        if (i !== -1) {
          queue[i] = _objectSpread({}, unprocessedMessage, {
            pendingProcessing: false
          });
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

app.delete('/deleteMessage', function (req, res) {
  var deleteId = req.body.id;

  if (!deleteId) {
    res.status(400).json({
      status: ERROR,
      msg: 'Request body must include parameter: id'
    });
  }

  queue = queue.filter(function (message) {
    return message.id != deleteId;
  });
  res.json({
    status: SUCCESS,
    msg: "".concat(deleteId, " deleted.")
  });
});
/* GET /allMessages
    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [{id: string, messageBody: string, processingPending: string}]
*/

app.get('/allMessages', function (req, res) {
  res.json(queue);
});
app.listen(PORT, function () {
  return console.log("Queue server listening on port ".concat(PORT, "!"));
});