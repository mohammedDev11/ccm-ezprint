const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getSharedAccounts,
  createSharedAccount,
  updateSharedAccount,
  changePrimaryAccount,
  addLinkedAccount,
  updateSharedAccountNotes,
  deleteSharedAccount,
} = require("./accounts.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/", getSharedAccounts);
router.post("/", createSharedAccount);
router.patch("/:accountId", updateSharedAccount);
router.patch("/:accountId/primary", changePrimaryAccount);
router.patch("/:accountId/link", addLinkedAccount);
router.patch("/:accountId/notes", updateSharedAccountNotes);
router.delete("/:accountId", deleteSharedAccount);

module.exports = router;
