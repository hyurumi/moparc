arena.transition = {};

arena.transition.nextDancer = function() {
  var dancers = document.getElementById('dancers');
  if (dancers.children.length > 0) {
    var nextDancer = dancers.children[0];
    if (arena.dom.video.currentTime === 0 && nextDancer.id.substring(7) === arena.socket.user.socket.socket.sessionid){
      console.log('nextDancer')
      var p = document.createElement('p');
      p.innerHTML = 'connect your kinnect'
      arena.dom.modalContent.appendChild(p);
      arena.dom.modal.style.display = 'block';
    }else if (arena.dom.video.currentTime > 0 && nextDancer.id.substring(7) !== arena.socket.user.socket.socket.sessionid) {
      console.log('Others Dancing');
      arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
      arena.view.animation.stop();
      arena.view.animation.play();
      arena.view.kinecting = true;
      $('#syncButton').show();
    } else if (arena.dom.video.currentTime === 0 && nextDancer.id.substring(7) !== arena.socket.user.socket.socket.sessionid) {
      arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
      arena.view.animation.stop();
      arena.view.animation.play();
      arena.view.kinecting = true;
    } else {
      arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
      arena.view.animation.stop();
      arena.view.animation.play();
      arena.view.kinecting = true;
      console.log('oyya?');
    }
  }else {
    arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
    arena.view.animation.stop();
    arena.view.animation.play();
    arena.view.kinecting = false;

  }
}
