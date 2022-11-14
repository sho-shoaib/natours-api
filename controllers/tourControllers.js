const Tour = require('./../models/tourModel.js');
const ApiFeatures = require('../utils/ApiFeatures.js');
const catchAsync = require('../utils/catchAsync.js');
const ThrowError = require('../utils/ErrorClass.js');

exports.getAllTours = catchAsync(async (req, res, next) => {
  const queryObj = { ...req.query };
  let features = new ApiFeatures(Tour.find(), queryObj);

  // Filtering
  features = features.filter();

  // Sorting
  features = features.sort();

  // Field Limiting
  features = features.fieldLimit();

  // Pagination
  features = features.pagination();

  const tours = await features.query;

  res.status(200).json({
    status: 'success',
    dataLength: tours.length,
    data: {
      tours,
    },
  });
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);

  res.status(200).json({
    status: 'success',
    data: {
      newTour,
    },
  });
});

exports.getTourById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const foundTour = await Tour.findById(id);

  if (!foundTour) {
    const err = new ThrowError(`No tour found with ${id} ID`, 404);
    next(err);
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: foundTour,
    },
  });
});

exports.updateTourById = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const newData = req.body;

  const updatedTour = await Tour.findByIdAndUpdate(id, newData, {
    new: true,
    runValidators: true,
  });

  if (!updatedTour) {
    const err = new ThrowError(`No tour found with ${id} ID`, 404);
    next(err);
    return;
  }

  res.status(200).json({
    status: 'success',
    data: {
      updatedTour,
    },
  });
});

exports.deleteTourById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedTour = await Tour.findByIdAndDelete(id);

  if (!deletedTour) {
    const err = new ThrowError(`No tour found with ${id} ID`, 404);
    next(err);
    return;
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.aliasTopTours = catchAsync(async (req, res, next) => {
  const data = await Tour.find().sort('price -ratingsAverage').limit(5);

  res.status(200).json({
    staus: 'success',
    length: data.length,
    data,
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: {
          $gte: 4.5,
        },
      },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // Group-by property
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        minRating: { $min: '$ratingsAverage' },
        maxRating: { $max: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: {
        price: 1,
      },
    },
  ]);

  res.status(200).json({
    staus: 'success',
    stats,
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = Number(req.params.year);

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: {
          $month: '$startDates',
        },
        numToursStarts: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: {
        month: '$_id',
      },
    },
    {
      $project: {
        _id: 0,
      },
    },
    {
      $sort: {
        numToursStarts: -1,
      },
    },
  ]);

  res.status(200).json({
    staus: 'success',
    plan,
  });
});
