/*global require, JSON */
var http = require('http');
var net = require('net');

var connect = require('connect');
var mongoose = require('mongoose');
var io = require('socket.io');
var _ = require('underscore');

var utils = require('./lib/utils');
var config = require('./config');

// Database and Model
mongoose = utils. connectToDatabase(mongoose, config.db.dev);
require('./models/user')(mongoose);
var User = mongoose.model('User');

//Database Init for debug
User.find({}, function(err, users){
  _.each (users, function(user){
    user.remove();
  });
});


// Static page
connect.createServer(
    connect.static(__dirname + "/public")
).listen(config.STATIC_PORT);


//IO Connections
var io;

if(process.env.NODE_ENV === "production")
  io = io.listen(config.SOCKETIO_PORT,{ 'log level': 1 });
else
  io = io.listen(config.SOCKETIO_PORT);

io.of("/user").on("connection", function(socket){
  //var address = socket.handshake.address;

  //START CONNECTION
  socket.on("connect", function(dataObject){
    var user = new User(_.pick(dataObject, 'name', 'positionR', 'positionTheta', 'rotationY','colorAngle'));
    user.socketId = socket.id;
    user.save( function (err){
      if (err) {
        console.log('====== err ======');
        console.log(err);
      }
      socket.broadcast.emit('addNewAudienceMesh',{user: user});
      socket.emit('connectComplete',{user: user});
    });
  });

  var loadUsers = function(){
    User.find({}, function(err,users){
      socket.broadcast.emit("loadUsers",{users: users});
      socket.emit("loadUsers",{users: users});
    });
  };
  socket.on('loadUsersWithMeshes', loadUsers);

  var loadUsersWithMeshes = function(){
    User.find({}, function(err,users){
      socket.emit("loadUsersWithMeshes",{users: users});
    });
  };
  socket.on('loadUsersWithMeshes', loadUsersWithMeshes);

  var loadDancers = function(){
    User.dancers(function(err, users){
      socket.broadcast.emit("loadDancers",{users: users});
      socket.emit("loadDancers",{users: users});
    });
  };
  socket.on('loadDancers', loadDancers);

  socket.on("requestNewEntry", function(){
    User.findOne({socketId: socket.id}, function(err,user){
      user.danceEntryDate = Date.now();
      user.isDanceEntry = true;
      user.save( function(err, user){
        if (err === null) {
          loadDancers();
        }
      });
    });
  });

  socket.on("cancelEntry", function(){
    User.findOne({socketId: socket.id}, function(err, user){
      user.isDanceEntry = false;
      user.save(function(err, user) {
        if (err === null) {
          loadDancers();
        }
      });
    });
  });
  socket.on('updateUser', function(dataObject){
    User.findOne({socketId: socket.id}, function(err, user){
      if (user !== null) {
        user.positionR = dataObject.positionR;
        user.positionTheta = dataObject.positionTheta;
        user.rotationY = dataObject.rotationY;
        user.save(function(){
          socket.broadcast.emit('updateUser', {user: user});
        });
      }
    });
  });

  socket.on('danceFinish', function(){
    User.findOne({socketId: socket.id}, function(err, user){
      user.isDanceEntry = false;
      user.save(function(){
        loadDancers();
        socket.broadcast.emit('danceInterrupted');
      });
    });
  });

  socket.on('requestNewText', function(dataObject){
    socket.broadcast.volatile.emit('requestNewText', dataObject);
  });

  socket.on('updateUserBehavior', function(dataObject){
    dataObject.socketId = socket.id;
    socket.broadcast.volatile.emit('updateUserBehavior', dataObject);
  });

  //END CONNECTION
  socket.on("disconnect", function(){
    //console.log(address.address + " disconnect..");
    User.currentDancer( function(err, user) {
      if (user !== null && user.socketId === socket.id) {
        socket.broadcast.emit('danceInterrupted');
        socket.broadcast.emit("leftAudience", {user: user});
        user.remove();
      }else {
        User.findOne({socketId: socket.id}, function(err, user){
          if (user !==null) {
            socket.broadcast.emit("leftAudience", {user: user});
            user.remove();
          }
        });
      }
    });
  });
});

io.of('/video').on('connection', function(socket){

  socket.on('connect', function(){
    console.log('hoge');
  });

  socket.on('startVideo', function(){
    socket.broadcast.emit('startVideo');
  });

  socket.on('getCurrentTime',function(){
    //User.find({}, function(err, users){
    User.currentDancer( function(err, user) {
      if (user !== null)
        socket.broadcast.emit('getCurrentTime', {socketIdDancing: user.socketId, socketId: socket.id});
    });
  });

  socket.on('notifyCurrentTime', function(dataObject){
    socket.broadcast.emit('notifyCurrentTime',dataObject);
  });

  socket.on("disconnect", function(){
  });


});

io.of("/motion").on("connection", function(client){
  client.on("message", function(message){
    console.log("message: " + message);
  });
  client.on("disconnect", function(){
  });
});


// TCP connection, receive data from OpenNI
net.createServer(function(socket){
  var buff = "";

  socket.on("data", function(openniData){
    console.log('CONNECTED: ' + socket.remoteAddress +':'+ socket.remotePort);
    var mess = buff + openniData.toString();
    mess = mess.slice(0, mess.length-1) + "}";
    console.log(mess);
    io.sockets.emit('message', mess); // odd approach
  });
  socket.on('error', function (in_exc) {
    console.log("ignoring exception: " + in_exc);
  });
}).listen(config.TCP_PORT);

