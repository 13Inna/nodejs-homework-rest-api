const express = require("express");

const ctrl = require("../../controllers/contacts");
const { validateBody,isValidId,authenticate } = require("../../middlewares");
const { schemas } = require("../../models/contact");

const router = express.Router();

router.get('/', authenticate, ctrl.getAllContacts);

router.get('/:contactId', authenticate, isValidId, ctrl.getContactById);

router.post('/', authenticate, validateBody(schemas.postContactSchema), ctrl.addContact);

router.put('/:contactId', authenticate, validateBody(schemas.putContactSchema), ctrl.updateContactById);

router.delete('/:contactId',authenticate, isValidId, ctrl.deleteContactById);

router.patch("/:contactId/favorite",authenticate, isValidId, validateBody(schemas.patchContactSchema), ctrl.updateFavorite); 

module.exports = router;

