const express = require("express");
const app = express();

const flips = require("./data/flips-data");
const counts = require("./data/counts-data");

app.use(express.json());

//defines a handler for the /counts path for a specific id.
app.use("/counts/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next({ status: 404, message: `Count id not found: ${countId}` });
  } else {
    res.json({ data: foundCount });
  }
});

//definse a handler for the /counts path.
app.use("/counts", (req, res) => {
  res.json({ data: counts });
});

//defines a handler for the /flips path for a specific id.
app.use("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));

  if (foundFlip) {
    res.json({ data: foundFlip });
  } else {
    next({ status: 404, message: `Flip id not found: ${flipId}` });
  }
});

//defines a handler for the /flips path.
app.get("/flips", (req, res) => {
  res.json({ data: flips });
});

function bodyHasResultProperty(req, res, next) {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next();
  }
  next({
    status: 400,
    message: `A "result" property is required`,
  });
}

let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

//updates /flips when new data is posted.
app.post("/flips", bodyHasResultProperty, (req, res, next) => {
  const { data: { result } = {} } = req.body;
  const newFlip = {
    id: ++lastFlipId,
    result,
  };
  flips.push(newFlip);
  counts[result] = counts[result] + 1;
  res.status(200).json({ data: newFlip });
});

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
