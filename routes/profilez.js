const express = require('express');
const { check } = require('express-validator');
const {
  createProfile,
  readProfiles,
  readProfile,
  updateProfile,
  deleteProfile,
  updateExperience,
  deleteExperience,
  updateEducation,
  deleteEducation,
} = require('../controllers/profiles');

const Profile = require('../models/Profile');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect } = require('../middleware/auth');

router.use(protect);
// router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(Profile), readProfiles)
  .post([
    // status must not be empty
    check('status', 'Status is Required')
      .not()
      .isEmpty(),
    // skills must exists
    check('skills', 'Skills is Required')
      .not()
      .isEmpty()],
    createProfile);

router
  .route('/:user_id')
  .get(readProfile)
  // .put(updateProfile)
  .delete(deleteProfile);

router
  .route('/experience')
  .put([
    // title
    check('title', 'Title is required')
      .not()
      .isEmpty(),
    // company
    check('company', 'Company is required')
      .not()
      .isEmpty(),
    // check
    check('from', 'From date is required and needs to be from the past')
      .not()
      .isEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
  ],
    updateExperience);

router
  .route('/experience/:exp_id')
  // router.delete('/experience/:exp_id', auth, async (req, res) => {
  .delete(deleteExperience);

router
  .route('/education')
  .put([
    check('school', 'School is required')
      .not()
      .isEmpty(),
    check('degree', 'Degree is required')
      .not()
      .isEmpty(),
    check('fieldofstudy', 'Field of study is required')
      .not()
      .isEmpty(),
    check('from', 'From date is required and needs to be from the past')
      .not()
      .isEmpty()
      .custom((value, { req }) => (req.body.to ? value < req.body.to : true))
  ],
    updateEducation);

router
  .route('/education/:edu_id')
  // router.delete('/education/:edu_id', auth, async (req, res) => {
  .delete(deleteEducation);

module.exports = router;
