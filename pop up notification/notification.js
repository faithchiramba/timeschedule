const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser'); // Add this line

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(bodyParser.json()); // Add this line

let workingTime = 0;
let breakTime = 0;
let intervalId = null;

// Route for setting the working time and break time
app.post('/set-times', (req, res) => {
  const newWorkingTime = parseInt(req.body.workingTime);
  const newBreakTime = parseInt(req.body.breakTime);
  if (newWorkingTime > 0 && newBreakTime > 0) {
    workingTime = newWorkingTime;
    breakTime = newBreakTime;
    if (intervalId !== null) {
      clearInterval(intervalId);
    }
    res.status(200).send(`Working time set to ${workingTime} minutes, Break time set to ${breakTime} minutes`);
  } else {
    res.status(400).send('Invalid working time or break time');
  }
});

// Route for starting the notifications
app.post('/start-notifications', (req, res) => {
  if (workingTime > 0 && breakTime > 0 && intervalId === null) {
    intervalId = setInterval(() => {
      // Emit a 'notification' event to all connected clients
      io.sockets.emit('notification', { message: 'Take a break!' });
      setTimeout(() => {
        io.sockets.emit('notification', { message: 'Back to work!' });
      }, breakTime * 60 * 1000); // Convert break time to milliseconds
    }, workingTime * 60 * 1000); // Convert working time to milliseconds

    res.status(200).send('Notifications started');
  } else {
    res.status(400).send('Invalid working time or break time, or notifications already started');
  }
});

// Start the server
const port = 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});