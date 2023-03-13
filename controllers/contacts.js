const { Contact } = require("../models/contact");
const { HttpError, ctrlWrapper } = require("../helpers");


const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;
  const result = await Contact.find({owner}, "-createdAt -updatedAt", {
    skip,
    limit,
  }).populate("owner", "name, email");
  res.json(result);
}

const getContactById = async (req, res) => {
  const { contactId } = req.params;
   const { _id: userId } = req.user;
    const result = await Contact.findById({ _id: contactId, owner: userId });
    if (!result) {
      throw HttpError(404, "Not found");
    }
  res.json(result);
}

const addContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create(...req.body, owner);
  res.status(201).json(result);
}

const updateContactById = async (req, res) => {
  const { name, email, phone } = req.body;

  const { contactId } = req.params;
  const { _id: userId } = req.user;
    if (!name && !email && !phone) {
      res.status(400).json({ message: "missing fields" });
    }
  const result = await Contact.findByIdAndUpdate(
    { _id: contactId, owner: userId },
    req.body,
    {
      new: true,
    });
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(result);
}

const deleteContactById = async (req, res) => {
  const { contactId } = req.params;
  const { _id: userId } = req.user;
    const result = await Contact.findByIdAndRemove({
    _id: contactId,
    owner: userId,
  });
    if (!result) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json({ message: "contact deleted" });
}
async function updateFavorite(req, res) {
  const { favorite } = req.body;

  const { contactId } = req.params;
  const { _id: userId } = req.user;
  if (!favorite  ) {
    res.status(400).json({ message: '"message": "missing fields"' });
  }

  const result = await Contact.findByIdAndUpdate( { _id: contactId, owner: userId },
    { favorite },
    {
      new: true,
    });
  if (!result) {
    throw HttpError(404, "Not found");
  }
  res.status(200).json(result);
};

module.exports = {
  getAllContacts: ctrlWrapper(getAllContacts),
  getContactById: ctrlWrapper(getContactById),
  addContact: ctrlWrapper(addContact),
  updateContactById: ctrlWrapper(updateContactById),
  deleteContactById: ctrlWrapper(deleteContactById),
  updateFavorite: ctrlWrapper(updateFavorite),
}