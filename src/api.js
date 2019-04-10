export function sendMessage(messageBody = '') {
  // Default options are marked with *
  return fetch('http://localhost:5000/sendMessage', {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messageBody }) // body data type must match "Content-Type" header
  }).then(response => response.json());
}

export function deleteMessage(id = '') {
  // Default options are marked with *
  return fetch('http://localhost:5000/deleteMessage', {
    method: 'DELETE', // *GET, POST, PUT, DELETE, etc.
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ id }) // body data type must match "Content-Type" header
  }).then(response => response.json());
}

export function getAllMessages() {
  return fetch('http://localhost:5000/allMessages')
    .then(res => res.json())
    .catch(err => console.log(err));
}

export function receiveMessages() {
  return fetch('http://localhost:5000/receiveMessages')
    .then(res => res.json())
    .catch(err => err.json());
}
