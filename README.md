# queueing-system-demo

### Description

This application is a simplified message queue with sendMessage, receiveMessages, and deleteMessage actions. The "database" is an in memory map in the form `id:string => {messageBody: string, pendingProcessing: bool}`. The client app allows you to demo the functionality of the queue as well as see the state of the queue at all times (polled every .5 seconds). Some things to try are:

- Sending messages to the queue from either client
- Requesting messages from either client and observing the "pendingProcessing" flag change to true
- Processing messages from the client, which deletes the message from the queue
- Attempting to request messages that are pending processing
- Sending a message from one client and then requesting it from another

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

**POST /api/sendMessage**

    summary: Adds messages from producer to DB
    parameters: { messageBody: string (Required) }
    responses:
      200: {id: string}
      400: {status: string, msg: string}
    errors:
      400: 'Request body must include parameter: messageBody'

**GET /api/receiveMessages**

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

**DELETE /api/deleteMessage**

    summary: Deletes message in DB with messageId
    parameters: {id: string (Required) }
    responses:
      200: {status: string, msg: string}
      400: {status: string, msg: string}
    errors:
      400: 'Request body must include parameter: id'

**GET /api/allMessages**

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

As the number of messages published increases, we can distribute the queue across multiple servers. We can achieve this by increasing the number of broker servers and redundantly storing messages on multiple storage servers. We'd request messages by polling a random sample of servers for messages, which is what AWS Simple Queue Service does to ensure high availability and throughput. However, this approach makes it possible to not receive all of the messages in the queue. For example, if messages A, B, C, and D were distributed across the 4 storage servers that the broker polls, but message E is on an unpolled server, the client will not see message E. To remedy this, we can use a pub/sub appraoch where messages are sent to topics and clients can subscribe to those topics. This ensures that consumers are seeing the messages that pertain to them while maintaining high throughput.

For either scenario, the broker and storage services would be containerized, load-balanced, and managed using Docker and Kubernetes. To reduce the response time from the queue, we can deploy this solution to geographically distributed zones and use an in-memory db (Redis) for rapid access to the messages.
