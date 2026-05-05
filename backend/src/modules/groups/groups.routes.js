const express = require("express");
const { requireAuth } = require("../../middleware/auth.middleware");
const { requireRole } = require("../../middleware/role.middleware");
const {
  getGroups,
  getGroupDetails,
  createGroup,
  updateGroup,
  deleteGroup,
} = require("./groups.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("Admin", "SubAdmin"));

router.get("/", getGroups);
router.get("/:groupId", getGroupDetails);
router.post("/", createGroup);
router.patch("/:groupId", updateGroup);
router.delete("/:groupId", deleteGroup);

module.exports = router;
