const express = require("express");
const http = require("http");
const mqtt = require("mqtt");
const socketIo = require("socket.io");
const cors = require("cors");
require("dotenv").config();

const port = 3344;
const app = express();

// Add Middleware
app.use(cors());

// WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

// Subscribe ke topik MQTT
mqttClient.on("connect", () => {
  console.log("Terhubung ke broker MQTT");
  mqttClient.subscribe(process.env.SUBSCRIBE);
});

// Subscribe and emit MQTT messages
mqttClient.on("message", (topic, message) => {
  console.log(`Pesan dari topik ${topic}: ${message.toString()}`);
  io.emit("mqtt-status", message.toString());
});

// Penanganan pesan dari Client
io.on("connection", (socket) => {
  console.log("Client terhubung");

  // Mendengarkan pesan dari Client
  socket.on("client-action", (action) => {
    console.log(action);

    // Mengirim perintah ke perangkat IoT berdasarkan aksi dari Client
    if (action === "LED ON" || action === "LED OFF") {
      // Kirim pesan MQTT ke perangkat IoT
      mqttClient.publish("led/alan", action);
    }
    // Di sini Anda dapat melakukan tindakan lain sesuai kebutuhan.
  });

  // Tangani penutupan koneksi Client jika diperlukan
  socket.on("disconnect", () => {
    console.log("Client terputus");
  });
});

// Menggunakan server Express.js
server.listen(port, () => {
  // Command: npm run dev
  console.log(`Example app listening on port http://127.0.0.1:${port}`);
});
