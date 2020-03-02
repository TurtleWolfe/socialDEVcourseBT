const express = require('express');
const {
  readWidgets,
  readWidget,
  createWidget,
  updateWidget,
  deleteWidget
} = require('../controllers/widgets');

const Widget = require('../models/Widget');

const router = express.Router({ mergeParams: true });

const advancedResults = require('../middleware/advancedResults');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
// router.use(authorize('admin'));

router
  .route('/')
  .get(advancedResults(Widget), readWidgets)
  .post(createWidget);

router
  .route('/:id')
  .get(readWidget)
  .put(updateWidget)
  .delete(deleteWidget);

module.exports = router;
