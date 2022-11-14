const ApiFeatures = class {
  constructor(query, queryObj) {
    this.query = query;
    this.queryObj = queryObj;
  }

  filter() {
    let queryString = JSON.stringify(this.queryObj);
    queryString = queryString.replace(
      /\b(gte|gt|lt|lte)\b/g,
      (match) => `$${match}`
    );

    // Query String:
    // {"difficulty": "easy", "duration": {"$gte": "5"}, "price": {"$lte": "1000"}}

    this.query.find(JSON.parse(queryString));

    // Steps:
    // 1. Get queryString from express and stringify the JSON
    // 2. Replace gt with $gt and lte with $lte in query string for mongoose to understand it
    // 3. use JSON.parse() to convert this query string to javascript object and use it in Model.find() method
    // 4. This method will return an Query object, we store this in an variable and we can perfrom further operations on it. Only when we 'await' this query object, we get the data that matches our query and conditions.

    return this;
  }

  sort() {
    if (this.queryObj.sort) {
      const sortBy = this.queryObj.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy); // sort("-price ratingsAverage")
    } else {
      this.query = this.query.sort('-createdAt');
    }

    // Steps:
    // 1. Get the values for key 'sort' from your query object
    // 2. These values will be passed in the Query.prototype.sort() method, so they need to be a particular order, they can be structured in 3 ways:
    // 2a. Object. The key of the object will be the field you want sort on the value of, and the value of this key can be asc, desc, ascending, descending, 1, and -1, only.
    // eg: query.sort({ field: 'asc', test: -1 });
    // 2b. String. The string passed must contain names of the fields, upon whose values you want to sort your data on, seperated by space and prefixed by - if you want it in descending order while default is ascending order.
    // eg: query.sort('field -test');
    // 2c. Array. The array passed must simply contain field names you want to sort on. These names must be prefixed by - if you want it descending order while default is ascending order. And array key value pair can also be used. // Dont use it, very confusing
    // eg: query.sort(['field', 'asc']]);
    // 3. After passing in the parameter, if your parameter is correct, it should work ;)

    return this;
  }

  fieldLimit() {
    if (this.queryObj.fields) {
      const fieldBy = this.queryObj.fields.split(',').join(' ');
      this.query = this.query.select(fieldBy); // Only get fieldBy "name price"
    }

    this.query = this.query.select('-__v'); // Exclude __v

    // Steps:
    // 1. Get field names from 'field' key in req.query object.
    // 2. Pass these fields in Query.prototype.select() method same way as the Query.prototype.sort() method. prefix with '-' to exclude, prefix with '+' to inlude field even if it is excluded from schema ({select: false} in Schema). Default is include.
    // eg: query.select('a b');

    return this;
  }

  pagination() {
    const page = Number(this.queryObj.page) || 1;
    const limit = Number(this.queryObj.limit) || 100;
    const skip = (page - 1) * limit; // if page = 2, skip = 10 i.e 11 - 20
    this.query = this.query.skip(skip).limit(limit);

    // Query.prototype.skip() take a number as parameter and skips that number of documents
    // Query.prototype.limit() takes a number as parameter and only gets that number of documents

    return this;
  }
};

module.exports = ApiFeatures;
