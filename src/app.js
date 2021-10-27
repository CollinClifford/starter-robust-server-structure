const express = require("express");
const app = express();

const countsRouter = require("./counts/counts.router");
const flipsRouter = require("./flips/flips.router");
const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

app.use(express.json());

//definse a handler for the /counts path.
app.use("/counts", countsRouter);

//defines a handler for the /flips path.
app.use("/flips", flipsRouter);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});

module.exports = app;
