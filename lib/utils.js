var _      = require('underscore')
var moment     = require('moment')
var fs     = require('fs')
//var crypto = require('crypto'),
var utils;

utils = {
  loadJson: function(filePath, callback) {
    fs.readFile(filePath, 'UTF-8', function(err, data) {
      var tempData = null, tempErr = null;

      if (err) {
        callback(err, null);
      } else {
        try {
          JSON.parse(data);
        }
        catch(err) {
          tempErr = err;
        }

        if (!tempErr) { tempData = JSON.parse(data); }

        callback(tempErr, tempData);
      }
    });
  },
  ifEnv: function(env, cb) {
    if (env === ENV) { cb(); }
  },
  connectToDatabase: function(mongoose, config, cb) {
    var dbPath;

    dbPath  = "mongodb://" + config.USER + ":";
    dbPath += config.PASS + "@";
    dbPath += config.HOST + ":";
    dbPath += config.PORT + "/";
    dbPath += config.DATABASE;

    return mongoose.connect(dbPath, cb);
  },
  cleanDb: function(Model, done) {
    Model.find().remove(function(err) {
      if (err) { throw err; }

      done();
    });
  },

  parseDbErrors: function(err, errorMessages) {
    var response = {}, errors = {};

    // MongoDB specific errors which are not caught by Mongoose
    if (err.name && err.name === 'MongoError') {
      // duplicate key error
      if (err.code === 11000 || err.code === 11001) {
        return {
          errors: {
            email: errorMessages.DUPLICATE
          }
        };
      } else {
        return {
          code: 500,
          errors: {
            internal: "internal error - data couldn't be saved"
          }
        };
      }
    } else if (err.name === 'ValidationError') {
      Object.keys(err.errors).forEach(function(key) {
        errors[key] = errorMessages[key.toUpperCase()];
      });
      response.errors = errors;

      return response;
    } else if (err.name === 'CastError' && err.type === 'date') {
      errors.born = errorMessages.BORN;
      response.errors = errors;

      return response;
    }

    return err;
  },
  getRandDate: function(from, date, unit) {
    var mom, min, max, timeUnit, timeVal, timeAction;

    min = 1;
    max = 31;

    if (!from) {
      timeAction = _.shuffle(['add', 'subtract'])[0];
      mom = moment();
    } else {
      if (!date) { throw new Error('Please provide a date for getRandDate(from, date)'); }

      mom = moment(date).clone();
      if (from === 'future') {
        // to get a future date you can just add time units
        timeAction = 'add';
      } else if (from === 'past') {
        // to get a past date you can just add time units
        timeAction = 'subtract';
      }
    }

    if (unit && unit.timeUnit && unit.timeVal) {
      timeUnit = unit.timeUnit;
      timeVal  = parseInt(unit.timeVal, 10);
    } else {
      timeUnit = _.shuffle(['months', 'days', 'minutes'])[0];
      timeVal  = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // http://momentjs.com/docs/#/manipulating/add/
    mom = mom[timeAction](timeUnit, timeVal);

    return mom.toDate();
  },
};

module.exports = utils;
