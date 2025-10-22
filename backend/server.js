// @ts-nocheck
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());

app.get("/", (req, res) => {
  res.send("✅ Real-time dashboard backend is running");
});

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  let lastPrice = null;

  setInterval(async () => {
    try {
      const res = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      lastPrice = res.data.bitcoin.usd;
    } catch (err) {
      console.error("Failed to fetch BTC price:", err.message);
    }
  }, 60000); // fetch every 1 minute

  setInterval(() => {
    if (lastPrice) {
      io.emit("price_update", {
        symbol: "BTC",
        price: lastPrice,
        time: new Date().toISOString(),
      });
    }
  }, 1000); // broadcast every second

  // Cleanup on disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
    clearInterval(interval);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
