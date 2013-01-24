arena.eventHandler = {};

arena.eventHandler.init = function(){
  //document.addEventListener('mousemove', arena.eventHandler.onMouseMove, false);
  $(window).resize(arena.eventHandler.onWindowResize);


  $('#danceEntryButton').on('click', arena.eventHandler.clickDanceEntryButtonHandler);
  $('#danceEntryCancelButton').on('click', arena.eventHandler.clickDanceEntryCancelButtonHandler);
  $('#danceInterceptButton').on('click', arena.eventHandler.clickDanceInterceptButtonHandler);
  arena.dom.video.addEventListener('ended', arena.eventHandler.clickDanceInterceptButtonHandler, false);
  $('#danceStartButton').on('click', arena.eventHandler.clickDanceStartButtonHandler);//in modal
  $('#syncButton').on('click', arena.eventHandler.clickSync);

  $('#particleSwitch').on('click', function(){
    if (arena.view.isParticle) {
      arena.view.isParticle = false;
      for (var i = 0; i < arena.view.particlesGroup.length; i++){
        arena.view.scene.remove( arena.view.particlesGroup[i] );
      }
      arena.socket.user.socket.emit('updateUserBehavior',{
        behavior:'particle', action:'stop'
      });
    } else {
      arena.view.isParticle = true;
      for (var i = 0; i < arena.view.particlesGroup.length; i++){
        arena.view.scene.add( arena.view.particlesGroup[i] );
      }
      arena.socket.user.socket.emit('updateUserBehavior',{
        behavior:'particle', action:'start'
      });
    }

  });

  // In landing Page
  $('#entryButton').on('click', arena.eventHandler.onEntryButtonClicked);

};

arena.eventHandler.clickDanceEntryButtonHandler = function(){
  arena.socket.user.socket.emit('requestNewEntry');
  $('#danceEntryButton').hide();
  $('#danceEntryCancelButton').show();
};

arena.eventHandler.clickDanceEntryCancelButtonHandler = function(){
   arena.socket.user.socket.emit('cancelEntry');
   $('#danceEntryButton').show();
   $('#danceEntryCancelButton').hide();
};

arena.eventHandler.clickDanceInterceptButtonHandler = function(){
  arena.dom.video.currentTime = 0;
  arena.dom.video.pause();
  if (arena.config.admin === true) {
    $('#danceEntryButton').show();
    $('#danceEntryCancelButton').hide();
    $('#danceInterceptButton').hide();
  }
  arena.socket.user.socket.emit('danceFinish');
  $('#particleSwitch').hide();
  $('#syncButton').hide();
  arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
  arena.view.animation.stop();
  arena.view.animation.play();
  arena.view.kinecting = false;
};

arena.eventHandler.clickSync = function(){
  arena.socket.video.socket.emit('getCurrentTime');
};

arena.eventHandler.clickDanceStartButtonHandler = function(){
  arena.dom.modal.style.display = 'none';
  arena.dom.video.play();
  $('#syncButton').show();
  $('#particleSwitch').show();
  $('#danceInterceptButton').show();
  $('#danceEntryCancelButton').hide();
  arena.socket.video.socket.emit('startVideo');
  arena.view.animation.stop();
  arena.view.animation.play();
  arena.view.kinecting = true;
  arena.view.kinectStartTimer = 3;
};


arena.eventHandler.onKeyDown = function ( event ) {

  switch ( event.keyCode ) {
    case 84: { // T toggle
      if (arena.config.CAMERA_MODE === "FIXED") {
        arena.config.CAMERA_MODE = "BACKED";
      } else {
        arena.config.CAMERA_MODE = "FIXED";
      }
      break;
    }

    case 87: // w
      arena.eventHandler.moveForward = true;
    break;

    //case 37: // left
    case 65:{ // a
      if (arena.config.CAMERA_MODE === "FIXED") {
        arena.view.cameraTarget3.x -= arena.view.angleCycle;
        arena.view.cameraTarget3.z -= arena.view.angleCycle;
      }else {
        arena.eventHandler.moveLeft = true; break;
      }
      break;
    }
    case 83: // s
      arena.eventHandler.moveBackward = true;
    break;

    //case 39: // right
    case 68: { // d
      if (arena.config.CAMERA_MODE === "FIXED") {
        arena.view.cameraTarget3.x += arena.view.angleCycle;
        arena.view.cameraTarget3.z += arena.view.angleCycle;
      }else {
        arena.eventHandler.moveRight = true;
      }
      break;
    }

    case 82: { // R
        arena.view.spinSpeed = 5;
        arena.socket.user.socket.emit('updateUserBehavior',{behavior:'spin', action:'start'});
      break;
    }

    case 67: { //C: Coloring
      arena.view.userMesh.material.materials[0].color.setHSV(
        arena.view.userMesh.colorAngle,
        0.8, 1
      );
      arena.socket.user.socket.emit('updateUserBehavior',{
        behavior:'color', action:'start'
      });
      break;
    }

    case 13: { // Enter: Word Effect
      $("#commentInput").show().focus();
      $('#commentInput').on('keyup', arena.eventHandler.onKeyUpInCommentInput);
      $(document).off('keydown');
      $(document).off('keyup');
      break;
    }
    case 32: { //Space: jump
      arena.eventHandler.jumping = true;
      arena.socket.user.socket.emit('updateUserBehavior',{behavior:'jump', action:'start'});
      break;
    }

    default:
      console.log(event.keyCode);
    break;
  }
};

arena.eventHandler.onKeyUpInCommentInput = function(event){
  switch(event.keyCode) {
    case 13: {
      var word = $('#commentInput').val().trim();
      if (word === "") return;
      if (word.length > 20){
        word = word.substring(0,20) + '...'
      }
      arena.view.newText({
        word: word,
        parameters: {
          size: 14,
          height: 3, //太さ
          curveSegments: 5,
          font: '07yasashisagothic'
        },
      }, function(dataObject){
        arena.socket.user.socket.emit('requestNewText', dataObject);
        $("#commentInput").val('');
        $("#commentInput").hide();
        $(document).on('keydown', arena.eventHandler.onKeyDown);
        $(document).on('keyup', arena.eventHandler.onKeyUp);
      });
      break;
    }
    case 27:{ //ESC: escape from input phase
      $("#commentInput").val('');
      $("#commentInput").hide();
      $(document).on('keydown', arena.eventHandler.onKeyDown);
      $(document).on('keyup', arena.eventHandler.onKeyUp);
      break;
    };
  }
};

arena.eventHandler.onKeyUp = function ( event ) {

  switch ( event.keyCode ) {
    //case 38: // up
    case 87: // w
      arena.eventHandler.moveForward = false;
    break;

    //case 37: // left
    case 65: // a
      arena.eventHandler.moveLeft = false; break;

    //case 40: // down
    case 83: // s
      arena.eventHandler.moveBackward = false;
    break;

    //case 39: // right
    case 68: // d
      arena.eventHandler.moveRight = false;
    break;

    case 82: { // R
      arena.view.spinSpeed = 0;
      arena.socket.user.socket.emit('updateUserBehavior',{behavior:'spin', action:'stop'});
      break;
    }
    case 67: { //C: Coloring
      arena.view.userMesh.material.materials[0].color.setHSV(
        arena.view.userMesh.colorAngle,
        0, 1
      );
      arena.socket.user.socket.emit('updateUserBehavior',{
        behavior:'color', action:'stop'
      });

      break;
    }

    case 32: { //Space: jump
      arena.eventHandler.jumping = false;
      arena.socket.user.socket.emit('updateUserBehavior',{behavior:'jump', action:'stop'});
      break;
    }
  }
};


arena.eventHandler.onEntryButtonClicked = function(){
  var position = arena.view.newPosition();

  var name = $('#entryName').val().trim();
  var random = Math.floor(Math.random() * 3);
  var colorAngle;
  if (random === 0)
    colorAngle = 330/360;
  else if (random === 1)
    colorAngle = 210/360;
  else
    colorAngle = 90/360;

  if (name !== ''){
    if (name === 'hyurumi'){
      arena.config.admin=true;
    }else {
      $('#danceEntryButton').hide();
    }
    arena.socket.user.socket.emit(
      'connect',
      {
        positionR: position.positionR,
        positionTheta: position.positionTheta,
        rotationY: position.rotationY,
        colorAngle: colorAngle,
        name: name
      }
    );
    $("#landing_page").hide();
    $(document).on('keydown', arena.eventHandler.onKeyDown);
    $(document).on('keyup', arena.eventHandler.onKeyUp);
    $('#instructions').delay(5000).fadeTo(1500, 0.1);
    $('#instructions').on('mouseover', function(e){
      $(this).fadeTo(500, 1.0);
    });
    $('#instructions').on('mouseout', function(){
      $(this).delay(3000).fadeTo(1500, 0.1);
    });
    arena.view.rendering = true;
  }

};


arena.eventHandler.onWindowResize = function() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  arena.view.camera.aspect = window.innerWidth / window.innerHeight;
  arena.view.camera.updateProjectionMatrix();
  arena.view.renderer.setSize( window.innerWidth, window.innerHeight );

  arena.view.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
  arena.view.composer.reset(
    new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, arena.view.rtParameters )
  );

  if (arena.dom.modal !== undefined){
    arena.dom.modal.style.height = window.innerHeight + 'px';
    arena.dom.modal.style.width = window.innerWidth + 'px';
    arena.dom.modalContent.style.height = window.innerHeight / 3 + 'px';
    arena.dom.modalContent.style.width = window.innerWidth / 3 + 'px';
    arena.dom.modalContent.style.margin = (window.innerHeight / 3 +  'px auto 0');
  }


}
