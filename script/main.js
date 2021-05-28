var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function () {
  return new BABYLON.Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true,
    disableWebGL2Support: false,
  });
};

var createScene = function () {
  scene = new BABYLON.Scene(engine);
  createCamera();
  createLight();

  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  informationsPanel(advancedTexture);

  return scene;
};

function createCamera() {
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    15,
    new BABYLON.Vector3(0, 0, 0)
  );
  camera.attachControl(canvas, true);
}

function createLight() {
  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );
}

var engine;
var scene;
initFunction = async function () {
  var asyncEngineCreation = async function () {
    try {
      return createDefaultEngine();
    } catch (e) {
      console.log(
        "the available createEngine function failed. Creating the default engine instead"
      );
      return createDefaultEngine();
    }
  };

  engine = await asyncEngineCreation();
  if (!engine) throw "engine should not be null.";
  scene = createScene();
};
initFunction().then(() => {
  sceneToRender = scene;
  engine.runRenderLoop(function () {
    if (sceneToRender && sceneToRender.activeCamera) {
      sceneToRender.render();
    }
  });
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});

function informationsPanel(advancedTexture) {
  var informationsPanel = new BABYLON.GUI.Rectangle();
  informationsPanel.width = 0.22;
  informationsPanel.height = "150px";
  informationsPanel.cornerRadius = 5;
  informationsPanel.thickness = 4;
  informationsPanel.background = "black";

  informationsPanel.horizontalAlignment =
    BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  informationsPanel.verticalAlignment =
    BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;

  informationsPanel.alpha = 0.7;

  var informations = new BABYLON.GUI.TextBlock();
  informations.text =
    "Projeto AF - Computação Gráfica II" +
    "\n\nLucas Nobrega - 180505" +
    "\n\nSérgio Vicente T. - 183263";
  informations.color = "white";
  informationsPanel.addControl(informations);
  advancedTexture.addControl(informationsPanel);
}
