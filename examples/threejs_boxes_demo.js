(function() {
  var camera, scene, renderer;
  var geometry, material, mesh;
  var controls, time = Date.now();

  var effect; // rift effect

  var objects = [];
  var stereoMap;

  var ray;

  // virtual world link
  var linkMesh;
  var linkUrl;
  var loadedList;

  // http://www.html5rocks.com/en/tutorials/pointerlock/intro/

  var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

  if ( havePointerLock ) {
    var element = document.body;

    var fullscreenchange = function ( event ) {
      if (document.fullscreenElement === element ||
	  document.mozFullscreenElement === element ||
	  document.mozFullScreenElement === element) {
	document.removeEventListener( 'fullscreenchange', fullscreenchange );
	document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
	element.requestPointerLock();
      }
    }

    document.addEventListener( 'fullscreenchange', fullscreenchange, false );
    document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

    element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

    var pointerlockchange = function ( event ) {
      if (document.pointerLockElement === element ||
	  document.mozPointerLockElement === element ||
	  document.webkitPointerLockElement === element) {
	controls.enabled = true;
      } else {
	controls.enabled = false;
      }
    }

    var pointerlockerror = function ( event ) {
    }

    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

    document.body.addEventListener( 'click', function ( event ) {
      // Ask the browser to lock the pointer
      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
      element.requestPointerLock();
    }, false );
  } else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
  }

  if (!vr.isInstalled()) {
    //statusEl.innerText = 'NPVR plugin not installed!';
    alert('NPVR plugin not installed!');
  }
  vr.load(function(error) {
    if (error) {
      //statusEl.innerText = 'Plugin load failed: ' + error.toString();
      alert('Plugin load failed: ' + error.toString());
    }

    try {
      init();
      animate();
    } catch (e) {
      //statusEl.innerText = e.toString();
      console.log(e);
    }
  });

  function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 1000 );

    scene = new THREE.Scene();
    scene.fog = new THREE.Fog( 0xffffff, 0, 750 );

    var light = new THREE.DirectionalLight( 0xffffff, 1.5 );
    light.position.set( 1, 1, 1 );
    scene.add( light );

    var light = new THREE.DirectionalLight( 0xffffff, 0.75 );
    light.position.set( -1, - 0.5, -1 );
    scene.add( light );

    controls = new THREE.OculusRiftControls( camera );
    scene.add( controls.getObject() );

    // var cameraHelper = new THREE.CameraHelper(camera);
    // scene.add(cameraHelper);

    ray = new THREE.Raycaster();
    ray.ray.direction.set( 0, -1, 0 );

    // seed random number generator
    Math.seedrandom('Hello Rift!');

    // floor

    geometry = new THREE.PlaneGeometry( 2000, 2000, 100, 100 );
    geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );

    for ( var i = 0, l = geometry.vertices.length; i < l; i ++ ) {

      var vertex = geometry.vertices[ i ];
      vertex.x += Math.random() * 20 - 10;
      vertex.y += Math.random() * 2;
      vertex.z += Math.random() * 20 - 10;

    }

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

      var face = geometry.faces[ i ];
      face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 3 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    }

    material = new THREE.MeshBasicMaterial( { vertexColors: THREE.VertexColors } );

    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

    // objects

    geometry = new THREE.CubeGeometry( 20, 20, 20 );

    for ( var i = 0, l = geometry.faces.length; i < l; i ++ ) {

      var face = geometry.faces[ i ];
      face.vertexColors[ 0 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 1 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 2 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );
      face.vertexColors[ 3 ] = new THREE.Color().setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

    }

    for ( var i = 0; i < 250; i ++ ) {

      material = new THREE.MeshPhongMaterial( { specular: 0xffffff, shading: THREE.FlatShading, vertexColors: THREE.VertexColors } );

      var mesh = new THREE.Mesh( geometry, material );
      mesh.position.x = Math.floor( Math.random() * 20 - 10 ) * 20;
      mesh.position.y = Math.floor( Math.random() * 20 ) * 20 + 10;
      mesh.position.z = Math.floor( Math.random() * 20 - 10 ) * 20;
      scene.add( mesh );

      material.color.setHSL( Math.random() * 0.2 + 0.5, 0.75, Math.random() * 0.25 + 0.75 );

      objects.push( mesh );

    }

    // link

    geometry = new THREE.CircleGeometry(10, 32);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(Math.PI));
    material = new THREE.MeshBasicMaterial();
    material.side = THREE.BackSide;
    stereoMap = {material:material, eyeTextures:[null, null]};
    linkMesh = new THREE.Mesh(geometry, material);

    //

    renderer = new THREE.WebGLRenderer({
      devicePixelRatio: 1,
      alpha: false,
      clearColor: 0xffffff,
      antialias: true,
      preserveDrawingBuffer: true
    });

    effect = new THREE.OculusRiftEffect( renderer );

    document.getElementById('ipd').innerHTML =
      effect.getInterpupillaryDistance().toFixed(3);

    document.body.appendChild( renderer.domElement );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', keyPressed, false );

    // Virtual World Link

    var dir = document.URL.substr(0, document.URL.lastIndexOf('/') + 1);
    vwl.init(dir + 'img/boxes_left.png', dir + 'img/boxes_right.png',
    function(url, left, right, _2d) {
      // ignore poster for now
    }, function(url, loaded, left, right) {
      if (url == linkUrl) {
        if (loaded) {
          linkDraw(left, right);
        }
        else {
          linkUrl = null;
          linkDraw();
        }
      }
    }, function(_loadedList) {
      loadedList = _loadedList;
    });

    vwl.getLoadedList();
  }

  function linkDraw(left, right) {
    if (left && right) {
      stereoMap.eyeTextures[0] = THREE.ImageUtils.loadTexture(left);
      stereoMap.eyeTextures[1] = THREE.ImageUtils.loadTexture(right);
      var pos = controls.getObject().position;
      linkMesh.position.set(pos.x, pos.y, pos.z-20);
      scene.add(linkMesh);
    }
    else {
      scene.remove(linkMesh);
    }
  }

  function onWindowResize() {
  }

  function keyPressed (event) {
    switch ( event.keyCode ) {
    case 79: // o
      effect.setInterpupillaryDistance(
        effect.getInterpupillaryDistance() - 0.001);
      document.getElementById('ipd').innerHTML =
        effect.getInterpupillaryDistance().toFixed(3);
      break;
    case 80: // p
      effect.setInterpupillaryDistance(
        effect.getInterpupillaryDistance() + 0.001);
      document.getElementById('ipd').innerHTML =
        effect.getInterpupillaryDistance().toFixed(3);
      break;

    case 70: // f
      if (!vr.isFullScreen()) {
        vr.enterFullScreen();
      } else {
        vr.exitFullScreen();
      }
      event.preventDefault();
      break;

    case 32: // space
      vr.resetHmdOrientation();
      event.preventDefault();
      break;

    case 13: // enter
      // open next VWL world
      if (loadedList) {
        if (linkUrl) {
          var index;
          for (index = 0; index != loadedList.length-1; index++) {
            if (linkUrl == loadedList[index]) {
              break;
            }
          }
          if (index < loadedList.length - 1) {
            linkUrl = loadedList[index+1];
          }
          else {
            linkUrl = loadedList[0];
          }
        }
        else {
          linkUrl = loadedList[0];
        }
        vwl.getInfo(linkUrl);
      }
      break;
    }
  }

  var vrstate = new vr.State();
  function animate() {
    vr.requestAnimationFrame(animate);

    controls.isOnObject( false );

    ray.ray.origin.copy( controls.getObject().position );
    ray.ray.origin.y -= 10;

    var intersections = ray.intersectObjects( objects );
    if ( intersections.length > 0 ) {
      var distance = intersections[ 0 ].distance;
      if ( distance > 0 && distance < 10 ) {
        controls.isOnObject( true );
      }
    }

    // Poll VR, if it's ready.
    var polled = vr.pollState(vrstate);
    controls.update( Date.now() - time, polled ? vrstate : null );

    // Check for intersection with the link
    if (linkUrl) {
      var pos = controls.getObject().position;
      linkMesh.lookAt(pos);
      if (pos.distanceTo(linkMesh.position) < 10 && linkUrl) {
        vwl.navigate(null, null, linkUrl);
        linkUrl = null;
        linkDraw();
        controls.reset(0, 0);
      }
    }

    //renderer.render( scene, camera );
    effect.render(scene, camera, polled ? vrstate : null,
                  stereoMap ? [stereoMap] : null);

    time = Date.now();
  }
})();
