import React, { useState } from 'react';
import { Card, Table, InputGroup, FormControl, Button } from 'react-bootstrap';
export default function Client({
  clientId,
  clientName,
  messages,
  onSendMessage,
  onReceiveMessages,
  onProcess
}) {
  const [messageBodyValue, setMessageBodyValue] = useState('');
  return (
    <Card border="success" style={{ width: '45vw' }}>
      <Card.Header>
        <b>{clientName}</b>
      </Card.Header>
      <Card.Body>
        <InputGroup className="mb-3">
          <FormControl
            placeholder="Message Body"
            aria-label="Message Body"
            value={messageBodyValue}
            onChange={e => setMessageBodyValue(e.target.value)}
          />
          <InputGroup.Append>
            <Button
              variant="primary"
              onClick={() => {
                onSendMessage(messageBodyValue);
                setMessageBodyValue('');
              }}
            >
              Send
            </Button>
          </InputGroup.Append>
        </InputGroup>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            margin: '1em 0'
          }}
        >
          <h5 style={{ margin: 'auto 0' }}>Messages</h5>
          <Button variant="info" onClick={() => onReceiveMessages(clientId)}>
            Request Messages
          </Button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>id</th>
              <th>body</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {messages.map(message => (
              <tr>
                <td>{message.id}</td>
                <td>{message.messageBody}</td>
                <td style={{ textAlign: 'center' }}>
                  <Button
                    variant="success"
                    onClick={() => onProcess(clientId, message.id)}
                  >
                    Process
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
