const WebSocket = require('ws');

// Create a new WebSocket server listening on port 4000
const wss = new WebSocket.Server({ port: 4000 }, () => {
  console.log('WebSocket server is running on ws://localhost:4000');
});

// Handle new client connections
wss.on('connection', (ws, req) => {
  console.log('A new client connected');

  // Optionally, extract query parameters if needed (e.g., lobbyId, userName)
  // For example, if you need them, you could use the `url` module:
  // const url = require('url');
  // const parameters = url.parse(req.url, true);
  // console.log(parameters.query);

  // Listen for messages from the client
  ws.on('message', (message) => {
    console.log('Received:', message);

    // For a simple echo server, just send the message back
    ws.send(message);

    // Or broadcast the message to all connected clients:
    // wss.clients.forEach(client => {
    //   if (client.readyState === WebSocket.OPEN) {
    //     client.send(message);
    //   }
    // });
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

// Handle server errors
wss.on('error', (error) => {
  console.error('WebSocket server error:', error);
});
