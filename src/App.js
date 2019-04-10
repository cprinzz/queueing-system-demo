import React, { Component } from "react";
import Queue from "./Components/Queue";
import Client from "./Components/Client";
import {
  getAllMessages,
  sendMessage,
  receiveMessages,
  deleteMessage
} from "./api";
import "./App.css";

class App extends Component {
  state = {
    messages: [],
    clientOne: {
      messages: []
    },
    clientTwo: {
      messages: []
    }
  };

  componentWillMount() {
    // Poll queue state every .5 seconds
    this.update();
    setInterval(() => this.update(), 500);
  }

  update() {
    getAllMessages().then(messages => this.setState({ messages }));
  }

  handleSendMessage = messageBody => {
    sendMessage(messageBody).then(() => this.update());
  };

  handleReceiveMessages = clientId => {
    receiveMessages()
      .then(messages => {
        this.setState({ ...this.state, [clientId]: { messages } });
        this.update();
      })
      .catch(err => console.log(err));
  };

  handleProcessMessage = (clientId, messageId) => {
    const { messages } = this.state[clientId];
    deleteMessage(messageId).then(() => {
      this.setState({
        ...this.state,
        [clientId]: {
          messages: messages.filter(message => message.id != messageId)
        }
      });
      this.update();
    });
  };

  render() {
    const { messages, clientOne, clientTwo } = this.state;
    return (
      <div className="App">
        <Queue messages={messages} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Client
            clientId="clientOne"
            clientName="Client 1"
            messages={clientOne.messages}
            onSendMessage={this.handleSendMessage}
            onProcess={this.handleProcessMessage}
            onReceiveMessages={this.handleReceiveMessages}
          />
          <Client
            clientId="clientTwo"
            clientName="Client 2"
            messages={clientTwo.messages}
            onSendMessage={this.handleSendMessage}
            onProcess={this.handleProcessMessage}
            onReceiveMessages={this.handleReceiveMessages}
          />
        </div>
      </div>
    );
  }
}

export default App;
