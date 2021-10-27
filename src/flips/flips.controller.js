const flips = require("../data/flips-data");
const counts = require("../data/counts-data");
const e = require("express");

let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

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

function list(req, res) {
  res.json({ data: flips });
}

function resultPropertyIsValid(req, res, next) {
  const { data: { result } = {} } = req.body;
  const validResult = ["heads", "tails", "edge"];
  if (validResult.includes(result)) {
    return next();
  } else {
    next({
      status: 400,
      message: `Value of the 'result' property must be one of the ${validResult}. Recieved: ${result}`,
    });
  }
}

function flipExists(req, res, next) {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));
  if (foundFlip) {
    return next();
  } else {
    next({
      status: 404,
      message: `Flip id not found: ${flipId}`,
    });
  }
}

function read(req, res) {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));
  res.json({ data: foundFlip });
}

function create(req, res, next) {
  const { data: { result } = {} } = req.body;
  const newFlip = {
    id: ++lastFlipId,
    result,
  };
  flips.push(newFlip);
  counts[result] = counts[result] + 1;
  res.status(200).json({ data: newFlip });
}

function update(req, res, next) {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));
  const originalResult = foundFlip.result;
  const { data: { result } = {} } = req.body;
  if (originalResult !== result) {
    foundFlip.result = result;
    counts[originalResult] = counts[originalResult] - 1;
    counts[result] = counts[result] + 1;
  }
  res.json({ data: foundFlip });
}

function destroy(req, res, next) {
  const { flipId } = req.params;
  const index = flips.findIndex((flip) => flip.id === Number(flipId));
  const deletedFlips = flips.splice(index, 1);
  deletedFlips.forEach(
    (deletedFlip) => (counts[deletedFlip] = counts[deletedFlip] - 1)
  );
  res.sendStatus(204);
}

module.exports = {
  list,
  read: [flipExists, read],
  create: [bodyHasResultProperty, resultPropertyIsValid, create],
  update: [flipExists, bodyHasResultProperty, resultPropertyIsValid, update],
  delete: [flipExists, destroy],
};
