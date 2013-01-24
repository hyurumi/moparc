window.addEventListener('load', function(){
  arena.view.scene = new THREE.Scene();
  arena.resource.initialize(function(){
    arena.dom.init();
    arena.view.init();
    arena.eventHandler.init();
    arena.view.animate();
    arena.socket.video.socket.emit('getCurrentTime');
    $('#loading').hide();
    $('#entry').show();
  });
  var elem;
});
