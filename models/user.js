module.exports = function(mongoose) {
  var Schema = mongoose.Schema

  var User = new Schema({
    name : {type: String, unique: true, trim: true },
    socketId  : {type: String, require : true},
    danceEntryDate: { type: Date, require: null},
    joinDate: { type: Date, default: Date.now},
    isDanceEntry: {type: Boolean, default: false},
    positionX : {type: Number, require : true},
    positionZ : {type: Number, require : true},
    positionR : {type: Number, require : true},
    positionTheta : {type: Number, require : true},
    rotationY : {type: Number, require : true},
    colorAngle : {type: Number, require : true}
  });

  User.statics.dancers = function(callback){
    var Model = mongoose.model('User');
    var query = Model.find();
    query.where('isDanceEntry').equals(true).sort('danceEntryDate').exec(callback);
  }

  User.statics.currentDancer = function(callback){
    var Model = mongoose.model('User');
    var query = Model.findOne();
    query.where('isDanceEntry').equals(true).sort('danceEntryDate').exec(callback);
  }

  return mongoose.model('User', User)
};
