# queueing-system-demo

### Description

This application is a simplified message queue with sendMessage, receiveMessages, and deleteMessage actions. The "database" is an in memory array with message stored as objects with attributes `{id: string, messageBody: string, pendingProcessing: bool}`.

### Setup

1. Clone the repo
   `git clone https://github.com/cprinzz/queueing-system-demo`
2. Install dependencies
   `cd queueing-system-demo && yarn`
3. Start the server
   `yarn start-server`
4. Open a new terminal tab, open the app directory, and start the app
   `yarn start`

### API Reference

**POST /sendMessage**

    summary: Adds messages from producer to DB
    parameters: { messageBody: string (Required) }
    responses:
      200: {id: string}
      400: {status: string, msg: string}

**GET /receiveMessages**

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

**DELETE /deleteMessage**

    summary: Deletes message in DB with messageId
    parameters: {id: string (Required) }
    responses:
      200: {status: string, msg: string}
      400: {status: string, msg: string}

**GET /allMessages**

    summary: Returns current state of the queue
    parameters: None
    responses:
      200: [
        {
          id: string,
          messageBody: string,
          processingPending: string
        }
      ]

### Scaling

As the number of messages published increases, we can distribute the queue across multiple servers.
