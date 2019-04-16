import uuidv1 from "uuid/v1";

class Database {
  queue = new Map();
  pending = new Map();

  addMessage(message) {
    const messageId = uuidv1();
    this.queue.set(messageId, message);
    return messageId;
  }

  deleteMessage(id) {
    if (this.queue.has(id)) {
      this.queue.delete(id);
    } else if (this.pending.has(id)) {
      this.pending.delete(id);
    }
  }

  toggleMessageStatus(id) {
    if (this.queue.has(id)) {
      const message = this.queue.get(id);
      this.queue.delete(id);
      this.pending.set(id, message);
    } else if (this.pending.has(id)) {
      const message = this.pending.get(id);
      this.pending.delete(id);
      this.queue.set(id, message);
    }
  }

  hasMessage(id) {
    return this.queue.has(id) || this.pending.has(id);
  }

  getUnprocessedMessages() {
    const unprocessedMessages = [];
    this.queue.forEach((value, key) => {
      unprocessedMessages.push({ id: key, ...value });
      this.toggleMessageStatus(key);
    });
    return unprocessedMessages;
  }

  getAllMessages() {
    const messages = [];
    this.queue.forEach((value, key) => {
      messages.push({ id: key, pendingProcessing: false, ...value });
    });
    this.pending.forEach((value, key) => {
      messages.push({ id: key, pendingProcessing: true, ...value });
    });
    return messages;
  }
}

const db = new Database();

export default db;
