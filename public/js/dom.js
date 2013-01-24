arena.dom = {};

arena.dom.init = function(){
  arena.dom.container = document.getElementById('container');

  arena.dom.modal = document.getElementById('modal');
  arena.dom.modal.style.height = window.innerHeight + 'px';
  arena.dom.modal.style.width = window.innerWidth + 'px';
  arena.dom.modal.style.position = 'absolute';
  arena.dom.modal.style.background = 'rgba( 0, 0, 0, 0.5)'
  arena.dom.modal.style.top = '0px';
  arena.dom.modal.style.zindex = '0';

  arena.dom.modalContent = document.getElementById('modalContent');
  arena.dom.modalContent.style.height = window.innerHeight / 3 + 'px';
  arena.dom.modalContent.style.width = window.innerWidth / 3 + 'px';
  arena.dom.modalContent.style.background = 'rgba( 255, 255, 255, 1)'
  arena.dom.modalContent.style.margin = (window.innerHeight / 3 +  'px auto 0');

  arena.dom.modal.style.display = 'none';

  $('#danceEntryButton').show();
  $('#danceEntryCancelButton').hide();
  $('#syncButton').hide();
  $('#danceInterceptButton').hide();
  $("#commentInput").hide();
};
