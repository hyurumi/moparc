arena.view.rendering = false;
arena.view.kinecting = false;
arena.view.kinectStartTimer = 0;
arena.view.windowHalfX = window.innerWidth / 2;
arena.view.windowHalfY = window.innerHeight / 2;
arena.view.clock = new THREE.Clock();
arena.view.FLOOR = -250;
arena.view.STAGE = {
  height: 50
};
arena.view.wall ={
  width: 800,
  height: 600,
  unit: 200
};
arena.view.spinSpeed = 0; //spinSpeed
arena.view.hex = 0xffffff; //ライトの色
arena.view.distance = 1000; //カメラ距離
arena.view.angleCycle = 60; //カメラ移動角度
arena.view.isAxis = false;
arena.view.isParticle = false;
arena.view.audiences = new Array();
arena.view.particleMaterials = [];
arena.view.particleParameters = [ [ [178/360, 1.0, 1.0], 5 ], [ [178/360, 0.8, 1], 4 ], [ [178/360, 0.6, 1], 3 ], [ [178/360, 0.4, 1], 2 ], [ [178/360, 0.2, 1], 1 ] ];
arena.view.cameraLength = 50;
//arena.view.velocity = new THREE.Vector3();
arena.view.velocity = {};
arena.view.velocity.r = 0;
arena.view.velocity.theta = 0;

arena.view.velocity.camera = {};
arena.view.velocity.camera.rotationY = 0;

arena.view.rtParameters = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat, stencilBuffer: true };
arena.view.texts= [];
arena.view.TEXT_LIFETIME = 7;

arena.view.player= {};
arena.view.player.parts = [
  'HEAD','NECK','TORSO',
  'LEFT_SHOULDER','LEFT_ELBOW','LEFT_HAND',
  'RIGHT_SHOULDER','RIGHT_ELBOW','RIGHT_HAND',
  'LEFT_HIP','LEFT_KNEE','LEFT_FOOT',
  'RIGHT_HIP','RIGHT_KNEE','RIGHT_FOOT'
];
arena.view.player.partQuaternions = [];
arena.view.player.partInitialPositions = [];
arena.view.player.partLengthes = [];

arena.func = {};
arena.func.QuaternionFromVectors = function(fVector, vectorA, vectorB, prevQua) {
  var epsilon = 0.000000001;
  var fromVector = fVector.clone().normalize();
  var toVector = (vectorA.clone()).subSelf(vectorB.clone()).normalize();

  var axis = (new THREE.Vector3()).cross(fromVector, toVector);
  var angle = Math.acos(fromVector.dot(toVector));

  var len = axis.length();
  if (len <= epsilon || isNaN(angle)){
    axis = new THREE.Vector3(0,0,0);
    angle = 0;
  }else {
    //axis = axis.divideScalar(len);
    axis = axis.normalize();
  }
  return (new THREE.Quaternion()).setFromAxisAngle(axis, angle);
}
arena.func.Vector3FromObject = function(obj){
  return new THREE.Vector3(obj.x, obj.y, -obj.z);
}

arena.view.player.convert = function(_pointA, _pointB, index){
  var pointA = _pointA.clone();
  var pointB = _pointB.clone();
  var sub = pointA.subSelf(pointB);
  var subTransformed = new THREE.Vector3(sub.x, sub.y, sub.z);
  var position = subTransformed.setLength(arena.view.player.partLengthes[index]);
  return position;
};

arena.view.player.setPartPosition = function(in_update){
  var pos = {};
  for (var i = 0; i < arena.view.player.parts.length; i++){
    pos[arena.view.player.parts[i]] = arena.func.Vector3FromObject(in_update[arena.view.player.parts[i]]);
  }
  pos['HIP'] = ((new THREE.Vector3()).add(pos['RIGHT_HIP'], pos['LEFT_HIP'])).divideScalar(2);
  //console.log(pos);
  //arena.view.player.prevPoint = pos['TORSO'];
  //arena.view.basepoint = arena.view.basepoint || pos['TORSO'];
  //arena.view.animation.hierarchy[0].position.addSelf(pos['TORSO'],arena.view.basepoint).multiplyScalar(0.0001);
  //とりあえず中心固定。

  var tree = arena.view.animation.hierarchy;

  tree[1].quaternion = arena.func.QuaternionFromVectors(tree[1].position, pos['NECK'], pos['TORSO']);
  tree[2].quaternion = arena.func.QuaternionFromVectors(tree[2].position, pos['HEAD'], pos['NECK']);

  //tree[17].quaternion = arena.func.QuaternionFromVectors(tree[17].position, pos['RIGHT_SHOULDER'], pos['TORSO']);
  tree[18].quaternion = arena.func.QuaternionFromVectors(tree[18].position, pos['RIGHT_ELBOW'], pos['RIGHT_SHOULDER']);
  tree[19].quaternion = arena.func.QuaternionFromVectors(tree[19].position, pos['RIGHT_HAND'], pos['RIGHT_ELBOW']);
  //tree[47].quaternion = arena.func.QuaternionFromVectors(tree[47].position, pos['LEFT_SHOULDER'], pos['TORSO']);
  tree[48].quaternion = arena.func.QuaternionFromVectors(tree[48].position, pos['LEFT_ELBOW'], pos['LEFT_SHOULDER']);
  tree[49].quaternion = arena.func.QuaternionFromVectors(tree[49].position, pos['LEFT_HAND'], pos['LEFT_ELBOW']);

  tree[38].quaternion = arena.func.QuaternionFromVectors(tree[38].position, pos['RIGHT_KNEE'], pos['HIP']);
  console.log(tree[38].quaternion)
  tree[39].quaternion = arena.func.QuaternionFromVectors(tree[39].position, pos['RIGHT_FOOT'], pos['RIGHT_KNEE']);
  console.log(tree[39].quaternion)

  //tree[39].position = tree[39].quaternion.multiplyVector3(arena.view.player.partInitialPositions[39])
 //tree[39].position = arena.view.player.convert(pos['RIGHT_KNEE'],pos['RIGHT_HIP'], 39);

  //tree[40].quaternion = arena.func.QuaternionFromVectors(tree[40].position, pos['RIGHT_FOOT'], pos['RIGHT_KNEE'], tree[39].quaternion);
  //tree[40].position = arena.view.player.convert(pos['RIGHT_FOOT'],pos['RIGHT_KNEE'], 40);

  tree[68].quaternion = arena.func.QuaternionFromVectors(tree[68].position, pos['LEFT_KNEE'], pos['HIP']);
  //tree[68].position = arena.view.player.convert(pos['LEFT_HIP'],pos['TORSO'], 68);
  //tree[69].position = arena.view.player.convert(pos['LEFT_KNEE'],pos['LEFT_HIP'], 69);
  //tree[70].position = arena.view.player.convert(pos['LEFT_FOOT'],pos['LEFT_KNEE'], 70);


};

arena.view.init = function() {
  //カメラ位置角度
  arena.view.cameraPos3 = new THREE.Vector3(0, arena.view.wall.height + arena.view.FLOOR,0);
  //カメラ移動先の位置角度
  arena.view.cameraTarget3 = new THREE.Vector3(0, 200 + arena.view.FLOOR,0);


  arena.view.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
  arena.view.camera.position.z = arena.view.distance;

  //arena.view.scene = new THREE.Scene();
  //arena.view.player = new arena.view.Player();


  // LIGHTS

  var hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 1 );
  hemiLight.color.setRGB( 0.8, 0.8, 0.7 );
  hemiLight.groundColor.setRGB( 0.95, 0.95, 0.75 );
  hemiLight.position.set( 0, 500, 0 );
  arena.view.scene.add( hemiLight );

  //
  //
  var dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
  dirLight.position.set( 0, arena.view.FLOOR + 300, 0 );
  arena.view.scene.add( dirLight );


/*
  var dirLight = new THREE.DirectionalLight( 0x0000ff, 0.2 );
  dirLight.position.set( -480, arena.view.FLOOR, -480 * Math.sqrt(3) );
  arena.view.scene.add( dirLight );

  dirLight = new THREE.PointLight( 0x00ff00, 0.2 );
  dirLight.position.set( -480 * 0.9, arena.view.FLOOR + 10, 0.9 * 480 * Math.sqrt(3) );
  arena.view.scene.add( dirLight );

  dirLight = new THREE.DirectionalLight( 0xff0000, 0.2);
  dirLight.position.set( 960, arena.view.FLOOR, 0 );
  arena.view.scene.add( dirLight );
  */


  arena.view.renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1, antialias: false } );
  arena.view.renderer.setSize( window.innerWidth, window.innerHeight );
  arena.view.renderer.autoClear = false;
  arena.view.renderer.sortObject = false;

  arena.dom.container.appendChild( arena.view.renderer.domElement );

  //PseudoLight
  arena.view.createGradMaterial = function (color){
    var canvas = document.createElement( 'canvas' );
    canvas.width = 500;
    canvas.height = 400;
    var context = canvas.getContext( '2d' );
    var gradient = context.createLinearGradient( 0, 0, 0, canvas.height);
    gradient.addColorStop( 0, 'rgba(' + color + ',0.7)' );
    gradient.addColorStop( 0.45, 'rgba(' + color + ',0.0)' );
    context.fillStyle = gradient;
    context.fillRect( 0, 0, canvas.width, canvas.height);
    var shadowTexture = new THREE.Texture( canvas );
    shadowTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial( { map: shadowTexture } );
    material.transparent = true;
    var geometry = new THREE.CylinderGeometry( 0, 200, arena.view.wall.height * 2, 50, 1 )
    geometry.computeBoundingBox();
    var bb = geometry.boundingBox;
    var offset = new THREE.Vector3((bb.min.x + bb.max.x) * 0.5,bb.min.y, (bb.min.z + bb.max.z) * 0.5);
    geometry.applyMatrix( new THREE.Matrix4().makeTranslation( offset.x, offset.y, offset.z ) );
    geometry.computeBoundingBox();
    return new THREE.Mesh( geometry, material );
  };

  arena.view.pseudoLights=[];
  arena.view.pseudoLightParameters=[
    {color:'195,229,231' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
    {color:'134,206,203' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
    {color:'19,122,127' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
    {color:'195,229,231' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
    {color:'134,206,203' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
    {color:'19,122,127' , positionX: arena.view.wall.unit * 2, positionZ: arena.view.wall.unit},
  ];
  for (var i = 0; i < 6; i++){
    var object = arena.view.createGradMaterial(arena.view.pseudoLightParameters[i].color);
    object.position.set(
      arena.view.wall.unit * 2 * Math.cos(Math.PI * i / 3),
      //arena.view.PseudoLightParameters[i].positionX,
      arena.view.wall.height + arena.view.FLOOR,
      arena.view.wall.unit * 2 * Math.sin(Math.PI * i / 3)
      //arena.view.PseudoLightParameters[i].positionZ
    );
    arena.view.scene.add( object );
    arena.view.pseudoLights.push(object);
  }

  //PARTICLES

  if (arena.view.isParticle) {
    var geometry = new THREE.Geometry();

    for ( i = 0; i < 1000; i ++ ) {

      var vertex = new THREE.Vector3();
      var r = Math.random() * 200;
      var theta = Math.random() * Math.PI * 2;
      vertex.x = r * Math.cos(theta);
      vertex.z = r * Math.sin(theta);
      vertex.y = Math.random() * 150;

      geometry.vertices.push( vertex );

    }
    var particles;
    for ( i = 0; i < arena.view.particleParameters.length; i ++ ) {

      size  = arena.view.particleParameters[i][1];
      color = arena.view.particleParameters[i][0];

      arena.view.particleMaterials[i] = new THREE.ParticleBasicMaterial({
        size: 10, //size,
        map: THREE.ImageUtils.loadTexture(
              "../images/particle.png"
        ),
        blending: THREE.AdditiveBlending,
        transparent: true
      });
      arena.view.particleMaterials[i].color.setHSV( color[0], color[1], color[2] );

      particles = new THREE.ParticleSystem( geometry, arena.view.particleMaterials[i] );
      particles.scale.set(i, 1 / i, i);
      particles.position.y = -(300 - 250 / (i + 1));

      //particles.rotation.x = Math.random() * 6;
      //particles.rotation.y = Math.random() * 6;
      //particles.rotation.z = Math.random() * 6;

      arena.view.scene.add( particles );

    }
    particles.sortParticles = true;
  }

  // WALLs

  arena.view.texture = new THREE.Texture( arena.dom.video );
  arena.view.texture.minFilter = THREE.LinearFilter;
  arena.view.texture.magFilter = THREE.LinearFilter;
  arena.view.texture.format = THREE.RGBFormat;
  arena.view.texture.generateMipmaps = false;

  var positions = [
    {positionX:0,    positionZ:-Math.sqrt(3)*arena.view.wall.unit * 2,    rotationY:0},
    {positionX:0,    positionZ: Math.sqrt(3)*arena.view.wall.unit * 2,    rotationY:Math.PI},
    {positionX:-arena.view.wall.unit * 3, positionZ: -arena.view.wall.unit * Math.sqrt(3),  rotationY:Math.PI / 3},
    {positionX: arena.view.wall.unit * 3,  positionZ:-arena.view.wall.unit * Math.sqrt(3), rotationY:-Math.PI / 3},
    {positionX:-arena.view.wall.unit * 3, positionZ:  arena.view.wall.unit * Math.sqrt(3),   rotationY: Math.PI * 2 / 3},
    {positionX: arena.view.wall.unit * 3,  positionZ: arena.view.wall.unit * Math.sqrt(3),   rotationY:-Math.PI * 2 / 3}
  ]

  var wall =  new THREE.PlaneGeometry( arena.view.wall.width, arena.view.wall.height );
  var parameters = { color: 0xffffff, map: arena.view.texture };

  for(var i=0; i < positions.length; i++){
    material = new THREE.MeshLambertMaterial( parameters );
    mesh = new THREE.Mesh(wall, material);
    mesh.position.x = positions[i].positionX;
    mesh.position.y = arena.view.FLOOR + arena.view.wall.height/2;
    mesh.position.z = positions[i].positionZ;
    mesh.rotation.y = positions[i].rotationY;
    arena.view.scene.add( mesh );
  }

  //STAGE
  var material = new THREE.MeshLambertMaterial({color: 0x666666, overdraw: true});
  var object = new THREE.Mesh( new THREE.CylinderGeometry( 120, 120, arena.view.STAGE.height, 100, 5 ), material );
  object.position.set( 0, arena.view.FLOOR + arena.view.STAGE.height / 2, 0 );
  arena.view.scene.add( object );

  // GROUND

  var groundTexture = THREE.ImageUtils.loadTexture( "images/floor.png" );
  console.log(groundTexture)
  groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
  groundTexture.repeat.set( 70, 70 );

  var groundMaterial = new THREE.MeshPhongMaterial( { map: groundTexture, emissive: 0xbbbbbb } );
  var planeGeometry = new THREE.PlaneGeometry( 2000, 2000 );

  var ground = new THREE.Mesh( planeGeometry, groundMaterial );
  ground.position.set( 0, arena.view.FLOOR, 0 );
  ground.rotation.x = -Math.PI/2;
  ground.receiveShadow = true;
  arena.view.scene.add( ground );

  var geometry = new THREE.SphereGeometry( 4, 10, 10);
  for (var i=0; i < 12; i++) {
  var material = new THREE.MeshLambertMaterial({color: 0xFFFFDD, overdraw: true});
    material.color.setHSV( 178 / 360 , 0.5 * Math.cos(Math.PI * 2 * i / 12) + 0.2, 1);
    var sphere = new THREE.Mesh(geometry,material);
    sphere.position.set(
      arena.view.wall.unit * Math.cos(Math.PI * 2 * i / 12),
      arena.view.FLOOR -1,
      arena.view.wall.unit * Math.sin(Math.PI * 2 * i / 12)
    );
    arena.view.scene.add(sphere);
  }


  for (var i=0; i < 24; i++) {
    var material = new THREE.MeshLambertMaterial({color: 0xFFFFDD, overdraw: true});
    material.color.setHSV( 178 / 360 , 0.5 * Math.sin(Math.PI * 2 * i / 24) + 0.2, 1);
    var sphere = new THREE.Mesh(geometry,material);
    sphere.position.set(
      arena.view.wall.unit * 2 * Math.cos(Math.PI * 2 * i / 24),
      arena.view.FLOOR -1,
      arena.view.wall.unit * 2 * Math.sin(Math.PI * 2 * i / 24)
    );
    arena.view.scene.add(sphere);
  }

  //Ceiling
  var ceiling = ground.clone();
  ceiling.position.y = arena.view.FLOOR + arena.view.wall.height;
  ceiling.rotation.x = Math.PI / 2;
  arena.view.scene.add( ceiling );

  arena.view.sceneGround = new THREE.Scene();
  //Axis
  if (arena.view.isAxis) {
    // AxisX
    var axisX = new THREE.Geometry();
    axisX.vertices.push(new THREE.Vector3(0,arena.view.FLOOR,0));
    axisX.vertices.push(new THREE.Vector3(10000,arena.view.FLOOR,0));
    arena.view.scene.add(new THREE.Line(axisX, new THREE.LineBasicMaterial({color:0xff0000, opacity:1.0, linewidth: 10})));
    // AxisY
    var axisY = new THREE.Geometry();
    axisY.vertices.push(new THREE.Vector3(0,arena.view.FLOOR,0));
    axisY.vertices.push(new THREE.Vector3(0,arena.view.FLOOR+10000,0));
    arena.view.scene.add(new THREE.Line(axisY, new THREE.LineBasicMaterial({color:0x00ff00, opacity:1.0})));
    var axisZ = new THREE.Geometry();
    axisZ.vertices.push(new THREE.Vector3(0,arena.view.FLOOR,0));
    axisZ.vertices.push(new THREE.Vector3(0,arena.view.FLOOR,10000));
    arena.view.scene.add(new THREE.Line(axisZ, new THREE.LineBasicMaterial({color:0x0000ff, opacity:1.0})));
  }


  var grid = new THREE.ParticleSystem( new THREE.PlaneGeometry( 2000, 2000, 150, 150 ), new THREE.ParticleBasicMaterial( { color: 0xffffff, size: 1 } ) );
  grid.position.y = arena.view.FLOOR;
  grid.rotation.x = - Math.PI / 2;
  //arena.view.sceneGround.add( grid );

  var renderSceneGround = new THREE.RenderPass( arena.view.sceneGround, arena.view.camera );
  var renderModel = new THREE.RenderPass(arena.view.scene, arena.view.camera);

  //POSTPROCESSING
  var clearSceneMask = new THREE.ClearMaskPass();

  var renderSceneMask = new THREE.MaskPass( arena.view.scene, arena.view.camera );
  var renderSceneMaskInverse = new THREE.MaskPass( arena.view.scene, arena.view.camera );

  renderSceneMaskInverse.inverse = true;

  var renderSceneGroundMask = new THREE.MaskPass( arena.view.sceneGround, arena.view.camera );
  var renderSceneGroundMaskInverse = new THREE.MaskPass( arena.view.sceneGround, arena.view.camera );
  renderSceneGroundMaskInverse.inverse = true;

  //renderModel.clear = false;
  renderSceneGround.clear = false;

  var effectBloom = new THREE.BloomPass(0.3);

  arena.view.effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
  arena.view.effectFXAA.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );

  var effectFocus = new THREE.ShaderPass(THREE.FocusShader);
  effectFocus.uniforms[ "screenWidth" ].value = window.innerWidth;
  effectFocus.uniforms[ "screenHeight" ].value = window.innerHeight;
  effectFocus.renderToScreen = true;

  var effectCopy = new THREE.ShaderPass(THREE.CopyShader);
  effectCopy.renderToScreen = true;

  arena.view.composer = new THREE.EffectComposer(
    arena.view.renderer,
    new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, arena.view.rtParameters )
  );

  arena.view.composer.addPass(renderModel);
  arena.view.composer.addPass(renderSceneGround);
  //arena.view.composer.addPass(renderSceneGroundMask);
  //arena.view.composer.addPass(clearSceneMask);
  arena.view.composer.addPass(effectBloom);
  arena.view.composer.addPass(arena.view.effectFXAA);
  //arena.view.composer.addPass(effectFocus);
  arena.view.composer.addPass(effectCopy);
}

arena.view.newPosition = function(rMin, unit){
  unit = unit || 55;
  rMin = rMin || 260;
  var r = rMin + Math.floor(Math.random() * 10) * unit;
  var theta = Math.random() * 2 * Math.PI;
  return {positionR:r, positionTheta: theta, rotationY: 0};
}

arena.view.newText = function(dataObject, callback) {
  var tg = new THREE.TextGeometry(
    dataObject.word,
    dataObject.parameters
  );
  tg.computeBoundingBox();
  THREE.GeometryUtils.center(tg);
  var color = (dataObject.position === undefined) ? 0x86cecb : 0xFFFFFF;
  var material =  new THREE.MeshBasicMaterial({
    color: color, overdraw: true//, wireframe: true, wireframeLinewidth: 1
  });
  var mesh=new THREE.Mesh(tg, material);
  var p;
  if (dataObject.position){
    p = dataObject.position;
  }else {
    p = {
        positionR: 130,
        positionTheta: Math.random() * 2 * Math.PI,
        positionY: 90 + Math.floor( Math.random() * 15 ) * 10
    };
  }
  //console.log(p.positionY);
  mesh.position = new THREE.Vector3(
    p.positionR * Math.cos(p.positionTheta),
    p.positionY + arena.view.FLOOR,
    p.positionR * Math.sin(p.positionTheta)
  );
  mesh.lifetime = arena.view.TEXT_LIFETIME;
  mesh.positionR = p.positionR;
  mesh.positionTheta = p.positionTheta;
  arena.view.scene.add(mesh);
  arena.view.texts.push(mesh);
  if (callback) {
    callback({word: dataObject.word, positionR: p.positionR, positionTheta:p.positionTheta, positionY: p.positionY});
  }
}

arena.view.removeText = function(mesh) {
  arena.view.scene.remove(mesh.body);
  arena.view.texts.splice(mesh.index, 1);
};

arena.view.newAudience = function(dataObject) {
  var cloneMaterials = [arena.view.audience.materials[0].clone(), arena.view.audience.materials[1]];
  console.log(dataObject)
  cloneMaterials[0].color.setHSV(dataObject.colorAngle, 0, 1);
  var material = new THREE.MeshFaceMaterial(cloneMaterials);
  var mesh = new THREE.Mesh( arena.view.audience.geometry, material);
  var positionX = dataObject.positionR * Math.cos(dataObject.positionTheta);
  var positionZ = dataObject.positionR * Math.sin(dataObject.positionTheta);
  mesh.position = new THREE.Vector3(positionX, arena.view.FLOOR, positionZ);
  console.log(mesh)

  mesh.positionR = dataObject.positionR + Math.PI / 2;
  mesh.positionTheta = dataObject.positionTheta;
  mesh.colorAngle = dataObject.colorAngle;
  mesh.lookAt(new THREE.Vector3(
    arena.view.scene.position.x,
    arena.view.scene.position.y + arena.view.FLOOR,
    arena.view.scene.position.z
  ));
  mesh.scale = new THREE.Vector3(7, 7, 7);
  mesh.spinSpeed = 0;
  mesh.socketId = dataObject.socketId;
  arena.view.scene.add( mesh );
  arena.view.audiences.push(mesh);
  if (dataObject.self){
    arena.view.userMesh = mesh;
  }
};

arena.view.removeAudience = function(dataObject) {
  var answer = arena.view.audiences.search(dataObject.socketId);
  arena.view.scene.remove(answer.mesh);
  arena.view.audiences.splice(answer.index, 1);
};

arena.view.audiences.search = function(socketId) {
  //console.log(this);
  for (var i = 0; i < this.length; i++){
    //console.log(socketId);
    //console.log(this[i].socketId);
    if (this[i].socketId === socketId) return {mesh:this[i], index: i};
  }
  return;
}

arena.view.animate = function() {
  requestAnimationFrame( arena.view.animate );
  arena.view.render();
}
arena.view.render = function() {
  if(!arena.view.rendering) return;
  if(arena.view.kinectStartTimer > 0) arena.view.kinectStartTimer -= 0.01;
  var time = Date.now() * 0.000004;

  // PARTICLE
  if (arena.view.isParticle) {
    var j = 0;
    for ( i = 0; i < arena.view.scene.children.length; i ++ ) {
      var object = arena.view.scene.children[ i ];
      if ( object instanceof THREE.ParticleSystem ) {
        if (j % 2===0)
          object.rotation.y += 0.003; //= time * ( i < 1 ? i + 1 : - ( i + 1 ) );
        else
          object.rotation.y -= 0.003; //= time * ( i < 1 ? i + 1 : - ( i + 1 ) );
        j++;
      }
    }
    /*for ( i = 0; i < arena.view.particleMaterials.length; i ++ ) {
      var color = arena.view.particleParameters[i][0];
      h = ( 360 * ( color[0] + time * 10 ) % 360 ) / 360;
      arena.view.particleMaterials[i].color.setHSV( h, color[1], color[2] );
    }
    */
  }

  // CAMERA
  if (arena.config.CAMERA_MODE === "BACKED") {

    if(arena.view.userMesh !== undefined) {
      var r = arena.view.userMesh.positionR + 20;
      arena.view.camera.position.x = r * Math.cos(arena.view.userMesh.positionTheta);
      arena.view.camera.position.y = arena.view.userMesh.position.y + 100;
      arena.view.camera.position.z = r * Math.sin(arena.view.userMesh.positionTheta);
    }
    arena.view.camera.lookAt(
      new THREE.Vector3(
        arena.view.scene.position.x,
        arena.view.camera.position.y + 30,
        arena.view.scene.position.z)
    );
  }else {
    //移動計算
    arena.view.cameraPos3.x += (arena.view.cameraTarget3.x - arena.view.cameraPos3.x) * 0.2;
    arena.view.cameraPos3.z += (arena.view.cameraTarget3.z - arena.view.cameraPos3.z) * 0.2;

    //カメラを動かす
    arena.view.camera.position.x = arena.view.distance * Math.sin( arena.view.cameraPos3.x * Math.PI / 180 );
    arena.view.camera.position.y = arena.view.cameraPos3.y;
    arena.view.camera.position.z = arena.view.distance * Math.cos( arena.view.cameraPos3.z * Math.PI / 180 );
    arena.view.camera.lookAt( new THREE.Vector3(
      arena.view.scene.position.x,
      arena.view.scene.position.y + arena.view.FLOOR,
      arena.view.scene.position.z
    ));

  }

  var delta = 1.0;

  if (arena.view.userMesh) {
    if (arena.view.userMesh.positionR > Math.sqrt(3)*arena.view.wall.unit * 2 -13 ){
      arena.view.velocity.r = 0 - arena.view.velocity.r;
      arena.view.userMesh.positionR = Math.sqrt(3) * arena.view.wall.unit * 2 - 14;
    }else if (arena.view.userMesh.positionR < 220) {
      arena.view.velocity.r = 0 - arena.view.velocity.r;
      arena.view.userMesh.positionR = 220 + 1;
    }
  }

  arena.view.velocity.r += ( - arena.view.velocity.r ) * 0.1 * delta;
  arena.view.velocity.theta += ( - arena.view.velocity.theta ) * 0.06 * delta;
  if (arena.view.velocity.r < 0.001 && arena.view.velocity.r > -0.001) {
    arena.view.velocity.r = 0;
  }
  if (arena.view.velocity.theta < 0.0001 && arena.view.velocity.theta > -0.0001) {
    arena.view.velocity.theta= 0;
  }

  if ( arena.eventHandler.moveBackward ) arena.view.velocity.r += 0.8 * delta;
  if ( arena.eventHandler.moveForward ) arena.view.velocity.r -= 0.8 * delta;

  if ( arena.eventHandler.moveRight ) arena.view.velocity.theta -= 0.003 * delta;
  if ( arena.eventHandler.moveLeft ) arena.view.velocity.theta += 0.003 * delta;

  if(arena.view.userMesh !== undefined){
    if (arena.view.velocity.theta === 0 && arena.view.velocity.r === 0){
     arena.view.userMesh.rotation.y += arena.view.spinSpeed * Math.PI * 0.03;

    } else {
      arena.view.userMesh.positionR += arena.view.velocity.r;
      arena.view.userMesh.positionTheta += arena.view.velocity.theta;
      arena.view.userMesh.position.x = arena.view.userMesh.positionR * Math.cos(arena.view.userMesh.positionTheta);
      arena.view.userMesh.position.z = arena.view.userMesh.positionR * Math.sin(arena.view.userMesh.positionTheta);
      arena.view.userMesh.lookAt( new THREE.Vector3(
        arena.view.scene.position.x,
        arena.view.scene.position.y + arena.view.FLOOR,
        arena.view.scene.position.z
      ));
    }
    if (arena.eventHandler.jumping){
      /*
      if(arena.view.userMesh.position.y === arena.view.FLOOR + arena.view.scene.position.y){
        arena.view.userMesh.position.y += 20;
      }else {
        arena.view.userMesh.position.y -= 20;
      }
      */
      arena.view.userMesh.jumping = true;
    }else {
      arena.view.userMesh.position.y = arena.view.FLOOR + arena.view.scene.position.y;
      arena.view.userMesh.jumping = false;
    }
    if (arena.view.velocity.theta !== 0 || arena.view.velocity.r !== 0) {
      arena.socket.user.socket.emit('updateUser', {
        positionR: arena.view.userMesh.positionR,
        positionTheta: arena.view.userMesh.positionTheta,
        rotationY: arena.view.userMesh.rotation.y,
      });
    }
  }

  for (var i = 0; i < arena.view.audiences.length; i++) { //jumping
    arena.view.audiences[i].rotation.y += arena.view.audiences[i].spinSpeed * Math.PI * 0.03;
    if (arena.view.audiences[i].jumping) {
      if(arena.view.audiences[i].position.y === arena.view.FLOOR + arena.view.scene.position.y){
        arena.view.audiences[i].position.y += 20;
      }else {
        arena.view.audiences[i].position.y -= 20;
      }
    }else {
      arena.view.audiences[i].position.y = arena.view.FLOOR + arena.view.scene.position.y;
    }
  }

 // TEXTs
  for (var i = 0; i < arena.view.texts.length; i++){
    arena.view.texts[i].positionTheta += 0.015;
    arena.view.texts[i].position.x = arena.view.texts[i].positionR * Math.cos(arena.view.texts[i].positionTheta);
    arena.view.texts[i].position.z = arena.view.texts[i].positionR * Math.sin(arena.view.texts[i].positionTheta);
    arena.view.texts[i].lookAt( new THREE.Vector3(
      arena.view.scene.position.x,
      arena.view.texts[i].position.y,
      arena.view.scene.position.z
    ));
    arena.view.texts[i].rotation.y += Math.PI;
   if (arena.view.texts[i].lifetime <= 0) {
      arena.view.removeText({body: arena.view.texts[i], index:i})
    }else {
      arena.view.texts[i].lifetime -= 0.01;
    }
  }
  //PseudoLightsMove
  for (var i =0; i< arena.view.pseudoLights.length; i++){
    if (i% 3 === 0) {
      arena.view.pseudoLights[i].rotation.x = 0.3 * Math.cos(Date.now() * 0.0005 * (i / 3 + 1));
      arena.view.pseudoLights[i].rotation.z = 0.5 * Math.sin(Date.now()* 0.0005 * (i / 3 + 1));
    }
    if (i% 3 === 2) {
      arena.view.pseudoLights[i].rotation.x = -0.5 * Math.cos(Date.now() * 0.0005 * (i / 3 + 1) );
      arena.view.pseudoLights[i].rotation.z = -0.4 * Math.cos(Date.now()* 0.0005  * (i / 3 + 1));
    }
    if (i% 3 === 1) {
      arena.view.pseudoLights[i].rotation.z = 0.4 * -Math.cos(Date.now() * 0.0005  * (i / 3 + 1));
      arena.view.pseudoLights[i].rotation.x = 0.5 * Math.cos(Date.now()* 0.0005 * (i / 3 + 1));
    }
  };

  if ( arena.dom.video.readyState === arena.dom.video.HAVE_ENOUGH_DATA ) {

    if ( arena.view.texture ) arena.view.texture.needsUpdate = true;

  }
  arena.view.renderer.clear();
  var delta = 0.75 * arena.view.clock.getDelta();
  if (arena.view.kinecting === false){
    THREE.AnimationHandler.update( delta );
    if (arena.view.animation.ik) {
      arena.view.animation.ik.update();
    }
  }
  arena.view.composer.render(0.01);
}
