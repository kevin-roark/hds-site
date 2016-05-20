

/// raf shim
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||
                                      window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/// True Code
(function() {
  var scene, camera, renderer;

  var ground, ambientLight, spt, bigBox;
  var boxes = [];
  var boxesAreMoving = false;

  var sptColor = {r: 255, g: 175, b: 175, goingBlue: true};
  function sptColorStr() { return 'rgb(' + sptColor.r + ',' + sptColor.g + ',' + sptColor.b + ')'; }

  init();
  animate();

  function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.z = 4000;

    ambientLight = new THREE.AmbientLight(0x555555);
    scene.add(ambientLight);

    ground = createGround();
    ground.position.set(0, -2000, 0);
    scene.add(ground);

    bigBox = new THREE.Object3D();
    bigBox._rotationSpeed = 0.0025;
    scene.add(bigBox);

    spt = createSpotLight();
    spt.color = new THREE.Color(sptColorStr());
    spt.position.set(0, 1500, 2200);
    scene.add(spt);
    //scene.add(spt.shadowCameraHelper); // add this to see shadow helper

    for (var x = -1000; x <= 1000; x += 200) {
      for (var z = -1000; z <= 1000; z += 200) {
        for (var y = -1000; y < 1000; y += 200) {
          var box = makeBox();
          box.position.set(x, y, z);
          box._vel = new THREE.Vector3(0, 0, 0);
          box._acc = new THREE.Vector3(randomA(), randomA(), randomA());

          bigBox.add(box);
          boxes.push(box);
        }
      }
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xfefefe);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.antialias = true;

    resize();
    window.addEventListener('resize', resize, false);

    document.body.appendChild(renderer.domElement);

    setTimeout(function() {
      boxesAreMoving = true;

      setInterval(resetBoxMovements, 3000);
    }, 8000);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (boxesAreMoving) {
      for (var i = 0; i < boxes.length; i++) {
        var box = boxes[i];
        box.position.add(box._vel);
        box._vel.add(box._acc);
      }
    }
    else if (bigBox) {
      bigBox.rotation.y += bigBox._rotationSpeed;
      bigBox._rotationSpeed += 0.00012;
    }

    if (sptColor.goingBlue) {
      sptColor.b += 1;
      sptColor.r -= 1;
      if (sptColor.r === 175) sptColor.goingBlue = false;
    }
    else {
      sptColor.r += 1;
      sptColor.b -= 1;
      if (sptColor.b === 175) sptColor.goingBlue = true;
    }
    spt.color = new THREE.Color(sptColorStr());

    renderer.render(scene, camera);
  }

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  }

  function resetBoxMovements() {
    function v() { return 0.1 * (Math.random() - 0.5); }

    for (var i = 0; i < boxes.length; i++) {
      var box = boxes[i];
      box._acc.x = -box._acc.x + v();
      box._acc.y = -box._acc.y + v();
      box._acc.z = -box._acc.z + v();
    }
  }

  function makeBox() {
    var geometry = new THREE.BoxGeometry(200, 200, 200);

    var material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;

    return mesh;
  }

  function randomA() {
    var a = Math.pow(Math.random(), 3);
    return Math.random() < 0.5 ? a : -a;
  }

  function createGround() {
    var geometry = new THREE.PlaneGeometry(10000, 10000);
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      emissive: 0xaaaaaa,
      side: THREE.DoubleSide
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    return mesh;
  }

  function createSpotLight() {
    var spt = new THREE.SpotLight(0xffffff, 1.5);
    spt.castShadow = true;
    spt.shadow.camera.near = 0.1;
    spt.shadow.camera.far = 20000;
    spt.shadow.mapSize.width = spt.shadow.mapSize.height = 1024;
    spt.shadowCameraHelper = new THREE.CameraHelper(spt.shadow.camera); // colored lines
    spt.angle = 1.0;
    spt.exponent = 2.0;
    spt.penumbra = 0.15;
    spt.decay = 1.25;
    spt.distance = 6000;

    return spt;
  }

  function randomBrightColor() {
    var key = Math.floor(Math.random() * 6);

    if (key === 0)
      return "rgb(" + "0,255," + v() + ")";
    else if (key === 1)
      return "rgb(" + "0," + v() + ",255)";
    else if (key === 2)
      return "rgb(" + "255, 0," + v() + ")";
    else if (key === 3)
      return "rgb(" + "255," + v() + ",0)";
    else if (key === 4)
      return "rgb(" + v() + ",255,0)";
    else
      return "rgb(" + v() + ",0,255)";

    function v() {
      return Math.floor(Math.random() * 256);
    }
  }

  function randomGrayColor() {
    var v = Math.floor(Math.random() * 200);
    return 'rgb(' + v + ',' + v + ',' + v + ')';
  }
})();