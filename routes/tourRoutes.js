const express = require('express');
const {
  getAllTours,
  createTour,
  getTourById,
  updateTourById,
  deleteTourById,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('./../controllers/tourControllers.js');
const authController = require('../controllers/authController.js');

const router = express.Router();

router.route('/top-cheapest-tours').get(aliasTopTours);
router.route('/tour-stats').get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/').get(authController.protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTourById)
  .patch(updateTourById)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    deleteTourById
  );

module.exports = router;
