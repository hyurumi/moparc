arena.resource = {
  material:{
    audience:'obj/boko.js',
    dancer:"obj/miku/miku.js",
    stage:"obj/stage/stage.js"
  },
  video : 'video/miku6.webm'
};

arena.resource.initialize = function(callback){

  //load video
  arena.dom.video = document.createElement('video');
  arena.dom.video.style.display = 'none';
  arena.dom.video.src = arena.resource.video;
  arena.dom.video.volume = 1.0;

  arena.dom.video.addEventListener('canplay',function(){
    arena.resource.loadMaterial();
    callback();
  });
};

function ensureLoop( animation ) {

  for ( var i = 0; i < animation.hierarchy.length; i ++ ) {

    var bone = animation.hierarchy[ i ];

    var first = bone.keys[ 0 ];
    var last = bone.keys[ bone.keys.length - 1 ];

    last.pos = first.pos;
    last.rot = first.rot;
    last.scl = first.scl;

  }

};
arena.resource.loadMaterial = function(){
  var loader = new THREE.JSONLoader();
  //loader.load( "obj/female/female.js", function(geometry, materials){
  loader.load( arena.resource.material.audience, function(geometry, materials){
    arena.view.audience = {};
    arena.view.audience.geometry = geometry;
    arena.view.audience.materials = materials;
  });
  loader.load( arena.resource.material.stage, function(geometry, materials){
    //console.log(geometry)
    //console.log(materials)

    arena.view.stage = {};
    arena.view.stage.geometry = geometry;
    arena.view.stage.material = new THREE.MeshFaceMaterial(materials);
    //STAGE
    var object = new THREE.Mesh( arena.view.stage.geometry, arena.view.stage.material );
    object.scale.set(6,12,6)
    object.position.set( 0, arena.view.FLOOR - 20, 0 );
    arena.view.scene.add( object );

  });
  loader = new THREE.MMDLoader();
  //loader.load('../models/miku/miku.js',function(geometry) {
  loader.load(arena.resource.material.dancer ,function(geometry) {
    //console.log(geometry)
    //THREE.AnimationHandler.add( geometry.animation );

    ensureLoop( geometry.animation );

    for ( var i = 0; i < geometry.materials.length; i ++ ) {

      var m = geometry.materials[ i ];
      m.skinning = true;

      m.wrapAround = true;

    }
    arena.view.player.mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial( geometry.materials ) );
    arena.view.player.mesh.position.set(0, arena.view.STAGE.height + arena.view.FLOOR, -100);
    arena.view.player.mesh.scale.set( 8,8,8 );
    //mesh.castShadow = true;
    //mesh.receiveShadow = true; // self shadow

    arena.view.scene.add( arena.view.player.mesh );

    if (geometry.animation.name) {
      THREE.AnimationHandler.add(geometry.animation);
      arena.view.animation = new THREE.Animation( arena.view.player.mesh, geometry.animation.name );
      arena.view.animation.JITCompile = false;
      arena.view.animation.interpolationType = THREE.AnimationHandler.LINEAR;
      arena.view.animation.play();
    }
    if (geometry.MMDIKs.length) {
      arena.view.animation.ik = new THREE.MMDIK(arena.view.player.mesh);
    }

  });

/*
  loader.load( arena.resource.material.dancer, function ( geometry, materials ) {
    console.log(geometry);
    //arena.view.createDancer( geometry, materials, 0, arena.view.STAGE.height + arena.view.FLOOR, -100, 8 );
  });
  */

};
arena.view.createDancer = function( geometry, materials, x, y, z, s ) {

  //In geometry, there is an animation object


  geometry.computeBoundingBox();
  var bb = geometry.boundingBox;
/*
  for (var i=0; i < geometry.animation.hierarchy.length; i++) {
    console.log(geometry.animation.hierarchy[i].keys.length);
  }
  */
  THREE.AnimationHandler.add( geometry.animation );

  for ( var i = 0; i < materials.length; i ++ ) {

    var m = materials[ i ];
    m.skinning = true;

    m.wrapAround = true;

  }

  mesh = new THREE.SkinnedMesh( geometry, new THREE.MeshFaceMaterial( materials ) );
  mesh.position.set( x, y - bb.min.y * s, z );
  mesh.scale.set( s, s, s );
  arena.view.scene.add( mesh );

  mesh.castShadow = true;
  mesh.receiveShadow = false; //self shadow

  arena.view.animation = new THREE.Animation( mesh, geometry.animation.name );
  arena.view.animation.JITCompile = false;
  arena.view.animation.interpolationType = THREE.AnimationHandler.LINEAR;

  for (var i=0; i < arena.view.animation.hierarchy.length; i++){
    arena.view.player.partQuaternions.push(arena.view.animation.hierarchy[i].quaternion.clone());
    arena.view.player.partLengthses.push(arena.view.animation.hierarchy[i].position.length());
  }
  //console.log(arena.view.player.partQuaternions);

  arena.view.animation.play();

};

