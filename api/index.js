const express = require("express");
const app = express();

const dotenv = require("dotenv");
const ticketRoute = require("./controller/tickets");
const mongo = require("./db/mongo");
const healthCheck = require("./utils/healthCheck");

dotenv.config();

// mongo DB connection
mongo();

// middleware
app.use(express.json());

// routes
app.use("/api", ticketRoute);
app.get("/api/db-check", healthCheck);

app.listen(process.env.PORT || 8800, () => {
  console.log("Backend server started");
});

// module.exports = app;
