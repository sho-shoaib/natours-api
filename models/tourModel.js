const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema(
  {
    name: {
      required: [true, 'A tour must have a name'],
      unique: true,
      type: String,
      trim: true,
      maxlength: [40, 'A tour name can only have upto 40 characters'],
      minlength: [5, 'A tour must have atleast 5 characters'],
      // validate: [validator.isAlpha, 'Tour name must only contain characters'],
    },
    duration: {
      required: [true, 'A tour must have a duraion'],
      type: Number,
    },
    ratingsAverage: {
      default: 4,
      type: Number,
      min: [1, 'Rating must be above 1'],
      max: [5, 'Rating must be below 5'],
    },
    ratingsQuantity: {
      default: 0,
      type: Number,
    },
    price: {
      required: [true, 'A tour must have a price'],
      type: Number,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a GroupSize'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a dfficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message:
          'A tour can only have "easy", "medium" and, "difficult", difficulty',
      },
    },
    priceDiscount: {
      type: Number,
      // This validate only works on create and save and not on update
      validate: {
        validator: function (val) {
          return val < this.price;
        },
        message: 'Discount price({VALUE}) must be lower than regular price',
      },
    },
    summary: {
      type: String,
      trim: true, // Remove white space from beginning and end
      required: [true, 'A tour must have a description'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover-image'],
    },
    images: {
      type: [String],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // dont send createdAt to client
    },
    startDates: {
      type: [Date],
    },
    slug: {
      type: String,
    },
    secretTour: {
      type: Boolean,
      default: false,
      select: false,
    },
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtual Properties (are not stored in database, calculated on fly and sent to user)
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Document middleware
tourSchema.pre('save', function (next) {
  this.slug = this.name.toLowerCase().replace(/\s/g, '-');
  next();
});

// tourSchema.post("save", function(doc, next) {
//   console.log(doc);
//   next()
// })

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start}ms`);
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

// We perform crud operations on model while schema is used to define the structure of the data

module.exports = Tour;
