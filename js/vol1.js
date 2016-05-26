


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
  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
  camera.position.z = 4000;

  var ambientLight = new THREE.AmbientLight(0x555555, 0.9);
  scene.add(ambientLight);

  var ground = createGround();
  ground.position.set(0, -2000, 0);
  scene.add(ground);

  var bigBox = new THREE.Object3D();
  bigBox._rotationSpeed = 0.0025;
  scene.add(bigBox);

  var sptColor = {r: 255, g: 175, b: 175, goingBlue: true};
  function sptColorStr() { return 'rgb(' + sptColor.r + ',' + sptColor.g + ',' + sptColor.b + ')'; }

  var topLight = createSpotLight(true);
  topLight.position.set(0, 1500, 1900);
  scene.add(topLight);
  //scene.add(spt.shadowCameraHelper); // add this to see shadow helper

  var frontLight = createSpotLight();
  frontLight.position.set(200, 0, 1500);
  scene.add(frontLight);

  var backLight = createSpotLight();
  backLight.position.set(-400, 200, 2500);
  scene.add(backLight);

  var sptLights = [topLight, frontLight, backLight];

  var boxes = [];
  var boxesAreMoving = false;
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

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xfefefe);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.gammaInput = true;
    renderer.gammaOutput = true;
    renderer.antialias = true;
  } catch (err) {
    // no-op is chill
  }

  resize();
  window.addEventListener('resize', resize, false);

  if (renderer) {
    document.body.appendChild(renderer.domElement);
  }

  animate();

  setTimeout(function() {
    boxesAreMoving = true;

    setInterval(resetBoxMovements, 3000);
  }, 8000);

  var isRed = true;
  var releaseTitleText = document.querySelector('.release-title-text');
  setTimeout(function() {
    swapColors();
    setInterval(swapColors, 3001);

    function swapColors() {
      isRed = !isRed;
      releaseTitleText.style.color = isRed ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';
    }
  }, 1200);

  var nameVaritions = [ 'HAPPINESS', 'HARMONIOUS', 'HD', 'HIDEOUS', 'HARMONIC', 'HARD', 'HAPTIC' ];

  setTimeout(function() {
    addVariation();
    setInterval(addVariation, 3000);

    function addVariation() {
      var div = document.createElement('div');
      div.textContent = nameVaritions[Math.floor(nameVaritions.length * Math.random())] + ' VOL. 1';
      div.className = 'release-title-text vol-1-title-text';
      div.style.position = 'absolute';
      div.style.fontSize = '50px';
      div.style.opacity = 0;
      div.style.zIndex = -1;
      div.style.color = isRed ? 'rgb(255, 0, 0)' : 'rgb(0, 0, 255)';

      var left = Math.random() * window.innerWidth * 0.84;
      div.style.left = left + 'px';

      var top = Math.random() * 125;
      div.style.top = top + 'px';

      document.body.appendChild(div);

      setTimeout(function() {
        div.style.opacity = 0.25;
      }, 1);
    }
  }, 9000);

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

    var color = new THREE.Color(sptColorStr());
    sptLights.forEach(function(light) {
      light.color = color;
    });

    if (renderer) {
      renderer.render(scene, camera);
    }
  }

  function resize() {
    if (renderer) {
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

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
      color: 0xaaaaaa,
      shininess: 1
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
      color: 0x999999,
      emissive: 0x444444,
      side: THREE.DoubleSide,
      shininess: 0,
      reflectivity: 0.25
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;

    return mesh;
  }

  function createSpotLight(shadow) {
    var spt = new THREE.SpotLight(0xffffff, 1.0);
    spt.color = new THREE.Color(sptColorStr());

    if (shadow) {
      spt.castShadow = true;
      spt.shadow.camera.near = 0.1;
      spt.shadow.camera.far = 20000;
      spt.shadow.mapSize.width = spt.shadow.mapSize.height = 1024;
      spt.shadowCameraHelper = new THREE.CameraHelper(spt.shadow.camera); // colored lines
    }

    spt.angle = 1.2;
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
})();

/// Payment stuff
(function() {
  var paymentInput = document.querySelector('.release-payment-input');
  var submitButton = document.querySelector('.release-paypal-button');
  var defaultPayment = 3;

  paymentInput.addEventListener('change', function() {
    validatePledgeInput();
  }, false);

  var moneyInterval;
  submitButton.addEventListener('mouseenter', function() {
    money();
    moneyInterval = setInterval(money, 80);

    function money() {
      var div = document.createElement('div');
      div.className = 'floating-money';
      div.innerText = '$';

      var left = Math.random() * window.innerWidth;
      div.style.left = left + 'px';

      var top = Math.random() * window.innerHeight;
      div.style.top = top + 'px';

      document.body.appendChild(div);
    }
  }, false);

  submitButton.addEventListener('mouseout', function() {
    clearInterval(moneyInterval);

    var monies = document.querySelectorAll('.floating-money');
    for (var i = 0; i < monies.length; i++) {
      document.body.removeChild(monies[i]);
    }
  }, false);

  function validatePledgeInput() {
    var rawVal = paymentInput.value;
    if (rawVal === undefined || rawVal.length === 0) {
      paymentInput.value = defaultPayment;
      return;
    }

    var value = Number(rawVal);
    if (isNaN(value)) {
      paymentInput.value = defaultPayment;
      return;
    }

    var money = value.toFixed(2);
    if (money < defaultPayment) {
      paymentInput.value = defaultPayment;
      return;
    }

    paymentInput.value = money;
  }
})();
