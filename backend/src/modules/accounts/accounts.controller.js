const {
  normalizeSharedAccountPayload,
  normalizePrimaryPayload,
  normalizeLinkedPayload,
} = require("./accounts.validation");
const {
  getSharedAccountsData,
  createSharedAccountData,
  updateSharedAccountData,
  changePrimaryAccountData,
  addLinkedAccountData,
  updateSharedAccountNotesData,
  deleteSharedAccountData,
} = require("./accounts.service");

const getSharedAccounts = async (req, res, next) => {
  try {
    const data = await getSharedAccountsData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const createSharedAccount = async (req, res, next) => {
  try {
    const payload = normalizeSharedAccountPayload(req.body, { requirePrimary: true });
    const data = await createSharedAccountData(payload);

    return res.status(201).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateSharedAccount = async (req, res, next) => {
  try {
    const payload = normalizeSharedAccountPayload(req.body);
    const data = await updateSharedAccountData(req.params.accountId, payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const changePrimaryAccount = async (req, res, next) => {
  try {
    const payload = normalizePrimaryPayload(req.body);
    const data = await changePrimaryAccountData(req.params.accountId, payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const addLinkedAccount = async (req, res, next) => {
  try {
    const payload = normalizeLinkedPayload(req.body);
    const data = await addLinkedAccountData(req.params.accountId, payload);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const updateSharedAccountNotes = async (req, res, next) => {
  try {
    const payload = normalizeSharedAccountPayload({ notes: req.body?.notes });
    const data = await updateSharedAccountNotesData(req.params.accountId, payload.notes);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteSharedAccount = async (req, res, next) => {
  try {
    const data = await deleteSharedAccountData(req.params.accountId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getSharedAccounts,
  createSharedAccount,
  updateSharedAccount,
  changePrimaryAccount,
  addLinkedAccount,
  updateSharedAccountNotes,
  deleteSharedAccount,
};
