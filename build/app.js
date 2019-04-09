"use strict";

var _v = _interopRequireDefault(require("uuid/v1"));

var _util = _interopRequireDefault(require("util"));

var _express = _interopRequireDefault(require("express"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var setTimeoutPromise = _util["default"].promisify(setTimeout);

var app = (0, _express["default"])();
app.use(_bodyParser["default"].json());
var PORT = 3000;
var VISIBILITY_TIMEOUT = 2000;
var queue = [];
/*  POST /sendMessage
    summary: Adds messages from producer to DB
    parameters: { messageBody: string }
    responses:
      200: {id: string}
      400: string
  */

app.post("/sendMessage", function (req, res) {
  var messageBody = req.body.messageBody;

  if (!messageBody) {
    res.status(400).send("Request body must include parameter: messageBody");
  }

  var message = {
    id: (0, _v["default"])(),
    messageBody: messageBody,
    pendingProcessing: false
  };
  queue.push(message);
  res.json({
    id: message.id
  });
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

app.get("/receiveMessages", function (req, res) {
  var unprocessedMessages = queue.filter(function (message) {
    return !message.pendingProcessing;
  });

  if (unprocessedMessages.length > 0) {
    // Send unprocessed messages
    var messages = unprocessedMessages.map(function (message) {
      return {
        id: message.id,
        messageBody: message.messageBody
      };
    });
    res.json(messages); // Change messages state to processing

    queue = unprocessedMessages.map(function (message) {
      return {
        id: message.id,
        messageBody: message.messageBody,
        pendingProcessing: true
      };
    }); // Start visibility timeout

    setTimeoutPromise(VISIBILITY_TIMEOUT, unprocessedMessages).then(function (unprocessedMessages) {
      if (queue.length > 0) {
        var updatedQueue = []; // Set update queue with messages set to unprocessed status

        unprocessedMessages.forEach(function (unprocessedMessage) {
          if (queue.find(function (message) {
            return message.id === unprocessedMessage.id;
          })) {
            updatedQueue.push(unprocessedMessage);
          }
        });
        queue = updatedQueue;
        console.log("TCL: receiveMessages timeout => ", queue);
      }
    });
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

app["delete"]("/deleteMessage", function (req, res) {
  var deleteId = req.body.id;

  if (!deleteId) {
    res.status(400).send("Request body must include parameter: id");
  }

  queue = queue.filter(function (message) {
    return message.id != deleteId;
  });
  res.send("".concat(deleteId, " deleted."));
});
app.listen(PORT, function () {
  return console.log("Example app listening on port ".concat(PORT, "!"));
});