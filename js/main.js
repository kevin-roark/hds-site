

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

  var boxesAreMoving = false;
  var boxes = [];

  init();
  animate();

  function init() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 20000);
    camera.position.y = 400;
    camera.position.z = 2000;

    for (var x = -1000; x <= 1000; x += 200) {
      for (var z = -1500; z <= 500; z += 200) {
        for (var y = 0; y < 1000; y += 200) {
          var box = makeBox();
          box.position.set(x, y, z);
          box._vel = new THREE.Vector3(0, 0, 0);
          box._acc = new THREE.Vector3(randomA(), randomA(), randomA());

          scene.add(box);
          boxes.push(box);
        }
      }
    }

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);

    resize();
    window.addEventListener('resize', resize, false);

    document.body.appendChild(renderer.domElement);

    setTimeout(function() {
      boxesAreMoving = true;
    }, 2000);

    setInterval(function() {
      resetBoxMovements();
    }, 7500);
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

    var material = new THREE.MeshBasicMaterial({
      color: randomGrayColor()
    });

    var mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = mesh.receiveShadow = true;

    return mesh;
  }

  function randomA() {
    var a = Math.pow(Math.random(), 3);
    return Math.random() < 0.5 ? a : -a;
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
