const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { redeemQuota } = require("./quota.controller");

const router = express.Router();

router.use(requireAuth);

router.post("/redeem", redeemQuota);

module.exports = router;
