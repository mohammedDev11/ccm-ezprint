const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  deleteRedeemCode,
  deleteRedeemCodesBulk,
  disableRedeemCode,
  disableRedeemCodesBulk,
  generateRedeemCodes,
  getRedeemCodes,
} = require("./redeem-codes.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/", getRedeemCodes);
router.post("/generate", generateRedeemCodes);
router.patch("/bulk/disable", disableRedeemCodesBulk);
router.post("/bulk/delete", deleteRedeemCodesBulk);
router.patch("/:id/disable", disableRedeemCode);
router.delete("/:id", deleteRedeemCode);

module.exports = router;
