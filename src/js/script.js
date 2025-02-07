// model list
const models = {
  "sample1": "Among us",
  "sample2": "モンスター",
  "sample6": "動くモンスター",
  "sample3": "樽",
  "sample4": "動く宝箱（カメラ移動あり）",
  "sample5": "動く宝箱（カメラ移動なし）",
  "sample7": "庭"
};

// ASSETS-LOAD
$(window).on('load', function() {

  $(".loading").fadeOut(600, function() {
    $(".container").css("opacity", "1");
  });

  Object.keys(models).forEach(function(i) {
    $('select').append($('<option>').html(models[i]).val(i));
  });
});

window.addEventListener('DOMContentLoaded', init);

var renderer;
var scene;
var loader;
const light = new THREE.DirectionalLight(0xFFFFFF);
light.intensity = 1; // 光の強さ
light.position.set(3, 10, 1);
let bgTexture = new THREE.TextureLoader().load("assets/img/bg.jpg");
const ambient = new THREE.AmbientLight(0xf8f8ff, 1);
var url = 'assets/3d/sample1.glb';
const w_height = window.innerHeight;
let controls;
let animationFlame;
let animations;
let clock;
let camera;
clock = new THREE.Clock();

function init() {
  // レンダラーを作成
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true,
    alpha: true,
  });

  // ウィンドウサイズ設定
  width = document.getElementById('main_canvas').getBoundingClientRect().width;
  height = document.getElementById('main_canvas').getBoundingClientRect().height;
  renderer.setPixelRatio(1);
  renderer.setSize(width, height);
  // renderer.physicallyCorrectLights = true;
  // renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // シーンを作成
  scene = new THREE.Scene();

  // カメラを作成
  camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
  camera.position.set(1000, 1000, -500);
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  // Load GLTF or GLB
  loader = new THREE.GLTFLoader();

  let model = null;

  loader.load(
    url,
    function(gltf) {
      model = gltf.scene;
      model.scale.set(100.0, 100.0, 100.0);
      model.position.set(0, (w_height / 3 * -1), 0);
      scene.add(gltf.scene);
    },
    function(error) {
      console.log('An error happened');
      console.log(error);
    }
  );
  renderer.gammaOutput = true;
  renderer.gammaFactor = 2.2;

  // シーンに追加
  scene.add(light);
  scene.add(ambient);
  // scene.background = bgTexture;

  // 初回実行
  tick();

  function tick() {
    controls.update();

    if (model != null) {
      // console.log(model);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
}

$("select").on("change", function() {
  // シーンを削除
  while (scene.children.length > 0) {
    scene.remove(scene.children[0]);
  }
  // シーンに追加
  scene.add(light);
  scene.add(ambient);
  url = "assets/3d/" + $(this).val() + ".glb";
  let model = null;
  loader.load(
    url,
    function(gltf) {
      animations = gltf.animations;
      model = gltf.scene;
      // model.name = "model_with_cloth";
      model.scale.set(100.0, 100.0, 100.0);
      model.position.set(0, (w_height / 3 * -1), 0);
      scene.add(gltf.scene);
      if (gltf.cameras[0]) {
        // カメラ一つを想定
        camera = gltf.cameras[0];
      }else{
        camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
        camera.position.set(1000, 1000, -500);
        controls = new THREE.OrbitControls(camera, renderer.domElement);
      }
      if (animations.length > 0) {
        $("btn").show();
      } else {
        $("btn").hide();
      }
      if (animations && animations.length) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        for (let i = 0; i < animations.length; i++) {
          let action = mixer.clipAction(animations[i]);
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.play();
        }
      }
    },
    function(error) {
      console.log('An error happened');
      console.log(error);
    }
  );
  renderer.render(scene, camera);
});

function tick() {
  renderer.render(scene, camera);
  animationFlame = requestAnimationFrame(tick);
  if (mixer) {
    mixer.update(clock.getDelta());
  }
}
$("btn").on("click", function() {
  window.cancelAnimationFrame(animationFlame);
  if (animations && animations.length) {
    for (let i = 0; i < animations.length; i++) {
      let action = mixer.existingAction(animations[i]);
      action.reset()
      action.play()
    }
  }
  clock.start()
  tick()
})
