import uuidv1 from "uuid/v1";

class Database {
  queue = new Map();

  addMessage(message) {
    const messageId = uuidv1();
    this.queue.set(messageId, message);
    return messageId;
  }

  deleteMessage(id) {
    this.queue.delete(id);
  }

  toggleMessageStatus(id) {
    const message = this.queue.get(id);
    this.queue.set(id, {
      ...message,
      pendingProcessing: !message.pendingProcessing
    });
  }

  hasMessage(id) {
    return this.queue.has(id);
  }

  getUnprocessedMessages() {
    const unprocessedMessages = [];
    this.queue.forEach((value, key) => {
      if (!value.pendingProcessing) {
        unprocessedMessages.push({ id: key, ...value });
        this.toggleMessageStatus(key);
      }
    });
    return unprocessedMessages;
  }

  getAllMessages() {
    const messages = [];
    this.queue.forEach((value, key) => {
      messages.push({ id: key, ...value });
    });
    return messages;
  }
}

const db = new Database()

export default db;
