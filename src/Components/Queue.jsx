import React from "react";
import { Card, Table } from "react-bootstrap";

export default function Queue({ messages }) {
  return (
    <Card border="primary" style={{ width: "50vw", margin: "3em auto" }}>
      <Card.Header>
        <b>Queue State</b>
      </Card.Header>
      <Card.Body>
        <Table hover>
          <thead>
            <tr>
              <th>id</th>
              <th>message body</th>
              <th>pending processing</th>
            </tr>
          </thead>
          <tbody>
            {messages.map(message => (
              <tr key={message.id}>
                <td>{message.id}</td>
                <td>{message.messageBody}</td>
                <td>{message.pendingProcessing ? "True" : "False"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
