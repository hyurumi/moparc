arena.socket = {};

arena.socket.user = {
  isEntry : false
};

arena.socket.user.socket = io.connect('http://' + window.location.hostname + ':' + arena.config.PORT + '/user');

//START CONNECTION
arena.socket.user.socket.on('connect', function(){
  console.log('open');
});

arena.socket.user.socket.on('connectComplete', function(){
  arena.socket.user.socket.emit('loadUsersWithMeshes');
  arena.socket.user.socket.emit('loadDancers');
});

//load entries just after starting connection.
arena.socket.user.socket.on('loadUsersWithMeshes', function(dataObject){
  $('#users').empty();
  $.each(dataObject.users, function(){
    $('#users').append('<div class="userItem" id="user_'+ this.socketId +'">' +
                       this.name + '</div>');
    if (arena.socket.user.socket.socket.sessionid === this.socketId){
      arena.view.newAudience({name: this.name, positionR: this.positionR, positionTheta: this.positionTheta, rotationY: this.rotationY, self: true, socketId: this.socketId, colorAngle: this.colorAngle});
    }
    else {
      arena.view.newAudience({name: this.name, positionR: this.positionR, positionTheta: this.positionTheta, rotationY: this.rotationY, self: false, socketId: this.socketId, colorAngle: this.colorAngle});
    }
  });
});

//load entries just after starting connection.
arena.socket.user.socket.on('loadUsers', function(dataObject){
  $('#users').empty();
  $.each(dataObject.users, function(){
    $('#users').append('<div class="userItem" id="user_'+ this.socketId +'">' +
                       this.name + '</div>');
  });
});


arena.socket.user.socket.on('loadDancers', function(dataObject){
  $('#dancers').empty();
  $.each(dataObject.users, function(){
    $('#dancers').append('<div class="dancerItem" id="dancer_'+ this.socketId +'">' +
                         this.name + '</div>');
  });
  arena.transition.nextDancer();
});

arena.socket.user.socket.on('addNewAudienceMesh', function(dataObject){
  arena.view.newAudience({
    name: dataObject.user.name,
    positionR: dataObject.user.positionR,
    positionTheta: dataObject.user.positionTheta,
    rotationY: dataObject.user.rotationY,
    colorAngle: dataObject.user.colorAngle,
    self: false,
    socketId: dataObject.user.socketId
  });
});

arena.socket.user.socket.on('updateUser', function(dataObject){
  //console.log(dataObject)
  var mesh = arena.view.audiences.search(dataObject.user.socketId);
  mesh.mesh.position.x = dataObject.user.positionR * Math.cos(dataObject.user.positionTheta);
  mesh.mesh.position.z = dataObject.user.positionR * Math.sin(dataObject.user.positionTheta);
  mesh.mesh.nameTextMesh.position.x = mesh.mesh.position.x;
  mesh.mesh.nameTextMesh.position.z = mesh.mesh.position.z;
  mesh.mesh.rotation.y = dataObject.user.rotationY;
  mesh.mesh.nameTextMesh.rotation.y = mesh.mesh.rotation.y;
  //console.log(mesh);
});

arena.socket.user.socket.on('leftAudience', function(dataObject){
  $('#user_' + dataObject.user.socketId).remove();
  $('#dancer_' + dataObject.user.socketId).remove();
  arena.view.removeAudience(dataObject.user);
});

arena.socket.user.socket.on('answerNewEntryRequest', function(dataObject){
  arena.socket.user.socket.emit('loadDancers');
  arena.transition.nextUser();
});

arena.socket.user.socket.on('danceInterrupted', function(){

  arena.dom.video.currentTime = 0;
  arena.dom.video.pause();
  arena.view.animation.stop();
  arena.view.animation.play();
  arena.view.kinecting = false;

  arena.socket.user.socket.emit('loadDancers');
  arena.transition.nextDancer();
});

arena.socket.user.socket.on('requestNewText', function(dataObject){
  arena.view.newText({
    word: dataObject.word,
    parameters: {
      size: 20,
      height: 3, //太さ
      curveSegments: 5,
      font: '07yasashisagothic'
    },
    position:{
      positionR: dataObject.positionR,
      positionTheta: dataObject.positionTheta,
      positionY: dataObject.positionY
    }
  },null);
});

arena.socket.user.socket.on('updateUserBehavior', function(dataObject){
  var mesh = arena.view.audiences.search(dataObject.socketId);
  if(dataObject.behavior === 'spin') {
    if (dataObject.action === 'start') {
      mesh.mesh.spinSpeed = 5;
    }else if (dataObject.action === 'stop'){
      mesh.mesh.spinSpeed = 0;
    }
  }else if(dataObject.behavior === 'jump') {
    if (dataObject.action === 'start') {
      mesh.mesh.jumping = true;
    }else if (dataObject.action === 'stop'){
      mesh.mesh.jumping = false;
    }
  }else if (dataObject.behavior === 'color'){
    if (dataObject.action === 'start') {
      mesh.mesh.material.materials[0].color.setHSV(
        mesh.mesh.colorAngle,
        0.8, 1
      );
    }else if (dataObject.action === 'stop'){
      mesh.mesh.material.materials[0].color.setHSV(
        mesh.mesh.colorAngle,
        0, 1
      );
    }
  } else if (dataObject.behavior === 'particle') {
    if (dataObject.action === 'start') {
      arena.view.isParticle = true;
      for (var i = 0; i < arena.view.particlesGroup.length; i++){
        arena.view.scene.add( arena.view.particlesGroup[i] );
      }
    }else if (dataObject.action === 'stop'){
      arena.view.isParticle = false;
      for (var i = 0; i < arena.view.particlesGroup.length; i++){
        arena.view.scene.remove( arena.view.particlesGroup[i] );
      }
    }
  }
});

//END CONNECTION
arena.socket.user.socket.on('disconnect', function(in_evt){
  console.log('close');
});

arena.socket.video = {};
arena.socket.video.socket = io.connect('http://' + window.location.hostname + ':' + arena.config.PORT + '/video');

arena.socket.video.socket.on('connect', function(){
  console.log('open');
});

arena.socket.video.socket.on('startVideo', function(){
  arena.dom.video.play();
  $('#syncButton').show();
});

arena.socket.video.socket.on('getCurrentTime', function(dataObject){
  console.log(dataObject.socketIdDancing);
  if (dataObject.socketIdDancing === arena.socket.video.socket.socket.sessionid){
    arena.socket.video.socket.emit('notifyCurrentTime', {currentTime: arena.dom.video.currentTime});
  }
});

arena.socket.video.socket.on('notifyCurrentTime', function(dataObject){
  //console.log(dataObject.currentTime);
  if (dataObject.currentTime !== 0) {
    arena.dom.video.currentTime = dataObject.currentTime+ arena.config.timeLag;
    arena.dom.video.play();
  }
});

arena.socket.motion = {};
//arena.socket.motion.socket = io.connect('http://' + window.location.hostname + ':' + arena.config.PORT + '/motion');
arena.socket.motion.socket = io.connect('http://' + window.location.hostname + ':' + arena.config.PORT);

arena.socket.motion.socket.on('connect', function(){ console.log('open'); });
arena.socket.motion.socket.on('message', function(in_data){ arena.socket.motion.socket.handleMessage(in_data); });
arena.socket.motion.socket.on('disconnect', function(in_evt){ console.log('close'); });
arena.socket.motion.socket.handleMessage = function(in_data){
  if(arena.view.kinecting === false) return;
  if(arena.view.kinectStartTimer > 0) return;
  //console.log(in_data);
  var data = JSON.parse(in_data);
  arena.view.player.setPartPosition(data);
};
