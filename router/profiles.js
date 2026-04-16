

const express = require('express');

const router = express.Router();
const {createProfile, getAllProfiles, getProfileById, deleteProfileById} = require('../controllers/profileController');



router.route('/').post(createProfile);
router.route('/').get(getAllProfiles);
router.route('/:id').get(getProfileById);
router.route('/:id').delete(deleteProfileById);

module.exports = router;