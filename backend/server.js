// @ts-nocheck
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods:['GET','POST']
    }
});

app.use(cors())

app.get('/', (req, res) => {
  res.send('✅ Real-time dashboard backend is running');
});

io.on('connection', (socket) => {
  console.log('🟢 Client connected:', socket.id);

  // Send mock data every second
  const interval = setInterval(() => {
    socket.emit('price_update', {
      symbol: 'BTC',
      price: (Math.random() * 50000).toFixed(2),
      time: new Date().toISOString()
    });
  }, 1000);

  // Cleanup on disconnect
  socket.on('disconnect', () => {
    console.log('🔴 Client disconnected:', socket.id);
    clearInterval(interval);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
