const router = require("express").Router();
const controller = require("./counts.controller");
const methodNotAllowed = require("../errors/methodNotAllowed");
const flipRouter = require("../flips/flips.router");

router.use("/:countId/flips", controller.countExists, flipRouter);

router.route("/").get(controller.list).all(methodNotAllowed);
router.route("/:countId").get(controller.read).all(methodNotAllowed);

module.exports = router;
