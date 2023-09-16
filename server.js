const express = require("express");
const http = require('http')
const mqtt = require("mqtt");
const socketIo = require('socket.io')
const cors = require("cors");
require("dotenv").config();

const port = 3000;
const app = express();

// Add Middleware
app.use(cors());

// WebSocket
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const mqttClient = mqtt.connect(process.env.MQTT_BROKER);

// Subscribe ke topik MQTT
mqttClient.on("connect", () => {
  console.log("Terhubung ke broker MQTT");
  mqttClient.subscribe("led/alan");
});

// Menampilkan pesan MQTT di konsol
mqttClient.on("message", (topic, message) => {
  console.log(`Pesan dari topik ${topic}: ${message.toString()}`);
  io.emit("mqtt-status", message.toString());
});

// Menggunakan server Express.js
server.listen(port, () => {
  // Command : npm run dev
  console.log(`Example app listening on port http://127.0.0.1:${port}`);
});
