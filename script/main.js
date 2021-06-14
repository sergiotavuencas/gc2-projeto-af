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

var pos = 0;

var createScene = function () {
  scene = new BABYLON.Scene(engine);
  camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    25,
    new BABYLON.Vector3(0, 0, 0)
  );
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0)
  );

  advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

  informationsPanel(advancedTexture);

  scene.enablePhysics(
    new BABYLON.Vector3(0, -9.8, 0),
    new BABYLON.CannonJSPlugin(false)
  );

  createRubeGoldbergMachine(true);

  var pew = new BABYLON.Sound("pew", "sounds/pew.mp3", scene, null, {
    loop: false,
    autoplay: false,
  });

  var killBox = BABYLON.MeshBuilder.CreateBox(
    "killBox",
    { width: 300, depth: 300, height: 0.5 },
    scene
  );
  killBox.position = new BABYLON.Vector3(0, -50, 0);
  killBox.visibility = 0;

  setTimeout(function () {
    var sphere = BABYLON.Mesh.CreateSphere("sphere", 10, 1, scene);
    sphere.isVisible = false;
    spawnMarbles(sphere, pew, killBox);
  }, 3000);

  return scene;
};

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

/********** Início dos métodos principais **********/
// Cria os elementos gráficos com as informações do grupo
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

// Cria a máquina de Rube Goldberg
function createRubeGoldbergMachine(visibleWalls) {
  var rubeGoldbergMachine = new BABYLON.Mesh("RubeGoldbergMachine");

  var start = createStartModel("start");
  rubeGoldbergMachine.addChild(start);

  var paths = createPaths("paths", visibleWalls);
  rubeGoldbergMachine.addChild(paths);

  var firstModel = createFirstModel("firstModel", visibleWalls);
  rubeGoldbergMachine.addChild(firstModel);

  var secondModel = createSecondModel("secondModel", visibleWalls);
  rubeGoldbergMachine.addChild(secondModel);

  var thirdModel = createThirdModel("thirdModel", visibleWalls);
  rubeGoldbergMachine.addChild(thirdModel);

  var fourthModel = createFourthModel("fourthModel");
  rubeGoldbergMachine.addChild(fourthModel);

  var fifthModel = createFifthModel("fifthModel");
  rubeGoldbergMachine.addChild(fifthModel);

  return rubeGoldbergMachine;
}

function spawnMarbles(sphereBase, spawnSound, killBox) {
  var spawnPoints = [
    new BABYLON.Vector3(0.25, 1, 0),
    new BABYLON.Vector3(0, 1, 0.25),
    new BABYLON.Vector3(-0.25, 1, 0),
    new BABYLON.Vector3(0, 1, -0.25),
    new BABYLON.Vector3(0.25, 1, 0.25),
    new BABYLON.Vector3(-0.25, 1, 0.25),
    new BABYLON.Vector3(0.25, 1, -0.25),
    new BABYLON.Vector3(-0.25, 1, -0.25),
  ];

  setInterval(function () {
    if (!scene.isReady()) return;
    var i = 1;

    while (i--) {
      var marble = sphereBase.clone("sphere");
      marble.position = spawnPoints[pos++];
      marble.material = marble.physicsImpostor = makePhysicsObject(
        marble,
        "sphere",
        2
      );
      marble.isVisible = true;
      spawnSound.play();

      if (pos == 7) {
        pos = 0;
      }

      marble.actionManager = new BABYLON.ActionManager(scene);

      marble.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: killBox,
          },
          function () {
            fadeAndDestroyMarble(marble);
          }
        )
      );
    }
  }, 3000);
}

function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min;
}

function fadeAndDestroyMarble(marble) {
  //the one line of code version
  BABYLON.Animation.CreateAndStartAnimation(
    "marbleVisAnim",
    marble,
    "visibility",
    30,
    30,
    1,
    0,
    0,
    null,
    () => {
      marble.dispose();
    }
  );
}
/********** Fim dos métodos principais **********/

/********** Início dos modelos **********/
// Cria a o início
function createStartModel(name) {
  var startModel = new BABYLON.Mesh(name);
  var diameter = 0.5;
  var posY = 0;

  for (let i = 0; i < 8; i++) {
    var step = BABYLON.MeshBuilder.CreateCylinder(
      "step",
      { height: 0.1, diameter: (diameter += 0.2) },
      scene
    );
    step.rotation.y = Math.random();
    step.position.y = posY;
    step.material = createTexture("textures/wood2.jpg");
    step.physicsImpostor = makePhysicsObject(step, "cylinder", 0, scene);
    startModel.addChild(step);

    posY -= 0.1;
  }

  const myShape = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(5, 0, 0),
    new BABYLON.Vector3(5, 0.5, 0),
    new BABYLON.Vector3(0, 0.5, 0),
  ];

  //Create lathe
  const lathe = BABYLON.MeshBuilder.CreateLathe("lathe", {
    shape: myShape,
    radius: 0.5,
    tessellation: 8,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  lathe.convertToFlatShadedMesh();
  lathe.position.y -= 1.25;
  lathe.physicsImpostor = makePhysicsObject(lathe, "mesh", 0, scene);
  lathe.material = createTexture("textures/wood1.jpg");
  startModel.addChild(lathe);

  return startModel;
}

function createPaths(name, visibleWalls) {
  var paths = new BABYLON.Mesh(name);

  var positions = [
    { x: -1.95, y: -2, z: 4.65 },
    { x: -4.7, y: -2, z: 1.9 },
    { x: -4.7, y: -2, z: -1.9 },
    { x: -1.95, y: -2, z: -4.65 },
    { x: 1.95, y: -2, z: -4.65 },
    { x: 4.7, y: -2, z: -1.9 },
    { x: 4.7, y: -2, z: 1.9 },
    { x: 1.95, y: -2, z: 4.65 },
  ];

  var rotations = [2.75, 1.96, 1.18, 0.4, -0.4, -1.18, -1.96, -2.75];

  for (let i = 0; i < 8; i++) {
    var platform = createPlatform(
      "platform",
      1.5,
      6,
      true,
      true,
      false,
      false,
      visibleWalls
    );
    platform.rotation.x = -0.4;
    platform.rotation.y = rotations[i];
    platform.position.x = positions[i].x;
    platform.position.y = positions[i].y;
    platform.position.z = positions[i].z;
    paths.addChild(platform);
  }

  return paths;
}

// Cria uma plataforma utilizando boxes e aplicando física
function createPlatform(
  name,
  width,
  depth,
  limitLeft,
  limitRight,
  limitBottom,
  limitUp,
  visibleWalls
) {
  var platform = new BABYLON.Mesh(name);

  var ground = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.1, width: width, depth: depth },
    scene
  );
  ground.physicsImpostor = makePhysicsObject(ground, "box", 0, scene);
  ground.material = createTexture("textures/wood2.jpg");
  platform.addChild(ground);

  if (limitLeft) {
    var boxLeft = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width / 6, depth: depth },
      scene
    );
    boxLeft.position.x = -width / 1.8;
    boxLeft.position.y = 0.25;
    boxLeft.material = createTexture("textures/wood1.jpg");
    boxLeft.visibility = visibleWalls;
    boxLeft.physicsImpostor = makePhysicsObject(boxLeft, "box", 0, scene);
    platform.addChild(boxLeft);
  }

  if (limitRight) {
    var boxRight = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width / 6, depth: depth },
      scene
    );
    boxRight.position.x = width / 1.8;
    boxRight.position.y = 0.25;
    boxRight.material = createTexture("textures/wood1.jpg");
    boxRight.visibility = visibleWalls;
    boxRight.physicsImpostor = makePhysicsObject(boxRight, "box", 0, scene);
    platform.addChild(boxRight);
  }

  if (limitBottom) {
    var boxBottom = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width + 0.4, depth: width / 6 },
      scene
    );
    boxBottom.position.z = -depth / 1.9;
    boxBottom.position.y = 0.25;
    boxBottom.material = createTexture("textures/wood1.jpg");
    boxBottom.visibility = visibleWalls;
    boxBottom.physicsImpostor = makePhysicsObject(boxBottom, "box", 0, scene);
    platform.addChild(boxBottom);
  }

  if (limitUp) {
    var boxUp = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width + 0.4, depth: width / 6 },
      scene
    );
    boxUp.position.z = depth / 1.9;
    boxUp.position.y = 0.25;
    boxUp.material = createTexture("textures/wood1.jpg");
    boxUp.visibility = visibleWalls;
    boxUp.physicsImpostor = makePhysicsObject(boxUp, "box", 0, scene);
    platform.addChild(boxUp);
  }

  return platform;
}

function createRoundedRamp(name, depth) {
  var roundedRamp = new BABYLON.Mesh(name);

  var capsuleLeft = new BABYLON.MeshBuilder.CreateCapsule("capsule", {
    radius: 0.3,
    capSubdivisions: 6,
    subdivisions: 6,
    tessellation: 36,
    height: depth,
    orientation: BABYLON.Vector3.Forward(),
  });
  capsuleLeft.position.x = -0.45;
  capsuleLeft.material = createTexture("textures/metal.jpg");
  capsuleLeft.physicsImpostor = makePhysicsObject(capsuleLeft, "", 0, scene);
  roundedRamp.addChild(capsuleLeft);

  var capsuleRight = new BABYLON.MeshBuilder.CreateCapsule("capsule", {
    radius: 0.3,
    capSubdivisions: 6,
    subdivisions: 6,
    tessellation: 36,
    height: depth,
    orientation: BABYLON.Vector3.Forward(),
  });
  capsuleRight.position.x = 0.45;
  capsuleRight.material = createTexture("textures/metal.jpg");
  capsuleRight.physicsImpostor = makePhysicsObject(capsuleRight, "", 0, scene);
  roundedRamp.addChild(capsuleRight);

  return roundedRamp;
}

// Cria uma escada de boxes com a quantidade de degraus específicada e suas dimensões
function createStairs(name, limitLeft, limitRight, visibleWalls) {
  var stairs = new BABYLON.Mesh(name);
  var box;
  var posY = 0;
  var posZ = 0;

  for (var i = 0; i < 5; i++) {
    box = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.5, width: 1.5, depth: 0.5 },
      scene
    );
    box.position.y = posY;
    box.position.z = posZ;
    box.material = createTexture("textures/wood2.jpg");
    box.physicsImpostor = makePhysicsObject(box, "box", 0, scene);
    stairs.addChild(box);

    if (limitLeft) {
      var leftBox = new BABYLON.MeshBuilder.CreateBox(
        "box",
        {
          width: 0.1,
          height: 1,
          depth: 1,
        },
        scene
      );
      leftBox.position.x -= 0.85;
      leftBox.position.y = posY;
      leftBox.position.z = posZ;
      leftBox.material = createTexture("textures/wood1.jpg");
      leftBox.visibility = visibleWalls;
      leftBox.physicsImpostor = makePhysicsObject(leftBox, "box", 0, scene);
      stairs.addChild(leftBox);
    }

    if (limitRight) {
      var rightBox = new BABYLON.MeshBuilder.CreateBox(
        "box",
        {
          width: 0.1,
          height: 1,
          depth: 1,
        },
        scene
      );
      rightBox.position.x = 0.85;
      rightBox.position.y = posY;
      rightBox.position.z = posZ;
      rightBox.material = createTexture("textures/wood1.jpg");
      rightBox.visibility = visibleWalls;
      rightBox.physicsImpostor = makePhysicsObject(rightBox, "box", 0, scene);
      stairs.addChild(rightBox);
    }

    posY -= 0.5;
    posZ -= 0.5;
  }

  return stairs;
}

// Cria uma escada de cilindros com a quantidade de degraus específicada e a distância entre eles
function createRoundedStairs(name, steps, zDistance) {
  var roundedStairs = new BABYLON.Mesh(name);
  var cylinder;
  var posY = 0;
  var posZ = 0;
  var diameter = 1;

  for (var i = 0; i < steps; i++) {
    cylinder = BABYLON.MeshBuilder.CreateCylinder(
      "cylinder",
      { height: 0.1, diameter: (diameter += 0.2) },
      scene
    );
    cylinder.position.y = posY;
    cylinder.position.z = posZ;
    cylinder.material = createTexture("textures/glass.jpg");
    cylinder.visibility = 0.8;
    cylinder.physicsImpostor = makePhysicsObject(
      cylinder,
      "cylinder",
      0,
      scene
    );
    roundedStairs.addChild(cylinder);

    posY -= 0.15;
    posZ -= zDistance;
  }

  return roundedStairs;
}

// Cria um modelo de fonte com partículas
function createFountain(posX, posY, posZ) {
  var particle = new BABYLON.ParticleSystem("particles", 5000);

  //Textura da partícula
  particle.particleTexture = new BABYLON.Texture("textures/flare.png");

  // Posição das partículas
  particle.emitter = new BABYLON.Vector3(0 + posX, 0.8 + posY, 0 + posZ); // emitted from the top of the fountain
  particle.minEmitBox = new BABYLON.Vector3(-0.01, 0, -0.01); // Starting all from
  particle.maxEmitBox = new BABYLON.Vector3(0.01, 0, 0.01); // To...

  particle.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
  particle.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);

  particle.minSize = 0.01;
  particle.maxSize = 0.05;

  particle.minLifeTime = 0.3;
  particle.maxLifeTime = 1.5;

  particle.emitRate = 1500;

  particle.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

  particle.gravity = new BABYLON.Vector3(0, -9.81, 0);

  particle.direction1 = new BABYLON.Vector3(-1, 8, 1);
  particle.direction2 = new BABYLON.Vector3(1, 8, -1);

  particle.minEmitPower = 0.2;
  particle.maxEmitPower = 0.6;
  particle.updateSpeed = 0.01;

  // Linhas para as coordenadas para a criação da fonte
  var fountainProfile = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(0.5, 0, 0),
    new BABYLON.Vector3(0.5, 0.2, 0),
    new BABYLON.Vector3(0.4, 0.2, 0),
    new BABYLON.Vector3(0.4, 0.05, 0),
    new BABYLON.Vector3(0.05, 0.1, 0),
    new BABYLON.Vector3(0.05, 0.8, 0),
    new BABYLON.Vector3(0.15, 0.9, 0),
  ];

  // Criação da fonte
  var fountain = BABYLON.MeshBuilder.CreateLathe("fountain", {
    shape: fountainProfile,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  fountain.position.x = posX;
  fountain.position.y = posY;
  fountain.position.z = posZ;

  var water = BABYLON.MeshBuilder.CreateCylinder(
    "water",
    { diameter: 0.8, height: 0.1 },
    scene
  );
  var material = new BABYLON.StandardMaterial("water", scene);
  material.diffuseTexture = new BABYLON.Texture("textures/water.jpg", scene);
  water.material = material;

  water.position.x = posX;
  water.position.y = posY + 0.1;
  water.position.z = posZ;

  particle.start();
}
function pinbox(){
  //objetos


  //base de madeira
  var base = BABYLON.MeshBuilder.CreateBox("base", {
    width: 7,
    height: 12,
    depth: 0.5,
  });
  //alinhamento com saida
  base.rotation.y = Math.PI/1.6;
  
  base.position.x = -7.5;
  base.position.y = -9.2;
  base.position.z = 3.2;

  //Vidro da frente
  var glass = BABYLON.MeshBuilder.CreateBox("frontGlass", {
    width: 7,
    height: 12,
    depth: 0.5,
  });
  //alinhamento com saida
  glass.rotation.y = Math.PI/1.6;
  
  glass.position.x = -10;
  glass.position.y = -9.2;
  glass.position.z = 4;

  var side1 = BABYLON.MeshBuilder.CreateBox("side1", {
    width: 0.2,
    height: 12,
    depth: 3,
  });
  
  side1.rotation.y = Math.PI/1.6;
  side1.position.x = -7.5;
  side1.position.y = -9.2;
  side1.position.z = 6.8;

  var side2 = side1.clone("side2");
  side2.position.x += -2.6;
  side2.position.y += 0;
  side2.position.z += -6.2;

  var bottom1 = BABYLON.MeshBuilder.CreateBox("b1", {
    width: 0.2,
    height: 2.5,
    depth: 3,
  });
  bottom1.position.x += -8.0;
  bottom1.position.y += -14.2;
  bottom1.position.z += 5.5;

  bottom1.rotation.z = Math.PI/4;
  bottom1.rotation.y = Math.PI/1.6;

  var bottom2 = bottom1.clone("bottom2"); 
  bottom2.position.x = -9.7;
  bottom2.position.y = -14.2;
  bottom2.position.z = 1.4;

  bottom2.rotation.z = -Math.PI/4;
   
  var pin = BABYLON.MeshBuilder.CreateCylinder(
    "pin",
    { diameter: 0.5, height: 1.5 },
    scene
  );
  pin.rotation.x+= Math.PI/2;
  pin.rotation.y+= Math.PI/1.6;
  
  pin.position.x = -9;
  pin.position.y = -9.2;
  pin.position.z = 4;

  var pin1=pin.clone("pin1");
  pin1.position.y+=2.4;
  pin1.position.z+=1.5;
  pin1.position.x+=0.7;
  var pin2=pin.clone("pin2");
  pin2.position.y+=2.4;
  pin2.position.z-=1.5;
  
  var pin3=pin.clone("pin3");
  pin3.position.y-=2.4;
  pin3.position.z-=1.5;
  var pin4=pin.clone("pin4");
  pin4.position.y-=2.4;
  pin4.position.z+=1.5;
  pin4.position.x+=0.7;
  var pin5=pin.clone("pin5");
  pin5.position.y+=5;
  pin5.position.z-=0;


  //materiais
  glassTexture = createTexture("textures/glass.jpg");
  glassTexture.alpha = 0.3;
  glass.material = glassTexture;
  
  base.material = createTexture("textures/wood2.jpg");

  side1.material = createTexture("textures/wood1.jpg");
  side2.material = createTexture("textures/wood1.jpg");

  bottom1.material = createTexture("textures/wood1.jpg");
  bottom2.material = createTexture("textures/wood1.jpg");
  
  //physics
  glass.physicsImpostor = makePhysicsObject(glass, "box", 0, scene);
  base.physicsImpostor = makePhysicsObject(base, "box", 0, scene);
  
  side1.physicsImpostor = makePhysicsObject(side1, "box", 0, scene);
  side2.physicsImpostor = makePhysicsObject(side2, "box", 0, scene);

  pin.physicsImpostor = makePhysicsObject(pin, "cylinder", 0, scene);
  pin1.physicsImpostor = makePhysicsObject(pin1, "cylinder", 0, scene);
  pin2.physicsImpostor = makePhysicsObject(pin2, "cylinder", 0, scene);
  pin3.physicsImpostor = makePhysicsObject(pin3, "cylinder", 0, scene);
  pin4.physicsImpostor = makePhysicsObject(pin4, "cylinder", 0, scene);
  pin5.physicsImpostor = makePhysicsObject(pin5, "cylinder", 0, scene);

  bottom1.physicsImpostor = makePhysicsObject(bottom1, "box", 0, scene);
  bottom2.physicsImpostor = makePhysicsObject(bottom2, "box", 0, scene);
}

// Criação da gangorra com uma junta
function createSeeSaw(scale, posX, posY, posZ) {
  var seeSaw = new BABYLON.Mesh("seeSaw");

  // Criação da tábua
  var board = BABYLON.MeshBuilder.CreateBox("board", {
    width: 3 * scale,
    height: 0.2 * scale,
    depth: scale / 2,
  });
  board.position.x = posX;
  board.position.y = posY;
  board.position.z = posZ;
  board.PhysicsImpostor = new BABYLON.PhysicsImpostor(
    board,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 2 },
    scene
  );
  board.material = createTexture("textures/wood2.jpg");
  seeSaw.addChild(board);

  var joint = BABYLON.MeshBuilder.CreateCylinder("joint", {
    height: scale / 2,
    diameter: scale / 3.5,
  });
  joint.position.x = posX;
  joint.position.y = posY - 1;
  joint.position.z = posZ;
  joint.rotation.x = Math.PI / 2;
  joint.material = createTexture("textures/metal.jpg");
  joint.PhysicsImpostor = new BABYLON.PhysicsImpostor(
    joint,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0 },
    scene
  );
  seeSaw.addChild(joint);

  var jointPhysic = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
    mainPivot: new BABYLON.Vector3(0, 0, 0),
    connectedPivot: new BABYLON.Vector3(0, -1, 0),
    mainAxis: new BABYLON.Vector3(0, 0, 0),
    connectedAxis: new BABYLON.Vector3(0, 0, 1),
  });

  joint.PhysicsImpostor.addJoint(board.PhysicsImpostor, jointPhysic);

  var ground = new BABYLON.MeshBuilder.CreateBox("ground", {
    width: 3 * scale,
    height: 0.1 * scale,
    depth: scale / 2,
  });
  ground.position.x = posX;
  ground.position.y = posY - 1.5;
  ground.position.z = posZ;
  ground.visibility = false;
  ground.physicsImpostor = makePhysicsObject(ground, "box", 0, scene);
  seeSaw.addChild(ground);

  return seeSaw;
}

function createDomino(scale, posX, posY, posZ) {
  const faceUV = [];
  faceUV[2] = new BABYLON.Vector4(0.0, 0.0, 1.0, 1.0); //rear face
  faceUV[3] = new BABYLON.Vector4(0.0, 0.0, 1.0, 1.0); //front face

  faceUV[0] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0);
  faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0);
  faceUV[4] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0);
  faceUV[5] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0);

  var domino = BABYLON.MeshBuilder.CreateBox("domino", {
    width: 0.3 * scale,
    height: 2 * scale,
    depth: 1 * scale,
    faceUV: faceUV,
  });

  domino.position.x = posX;
  domino.position.y = posY + scale;
  domino.position.z = posZ;

  domino.material = createTexture("textures/domino.png");

  domino.physicsImpostor = new BABYLON.PhysicsImpostor(
    domino,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: scale / 4 },
    scene
  );
}

function createBaloon(scale, posX, posY, posZ) {
  var baloon = new BABYLON.Mesh("baloon");

  // Criação do balão
  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {
    diameter: 1 * scale,
    segments: 32,
  });

  sphere.position.x = posX;
  sphere.position.y = posY;
  sphere.position.z = posZ;

  // Pontos para a linha do balão
  const wirePoints = [
    // Ponto Inicial
    new BABYLON.Vector3(
      sphere.position.x,
      sphere.position.y - scale / 2, // Inicia na base da esfera
      sphere.position.z
    ),
    // Ponto final
    new BABYLON.Vector3(
      sphere.position.x,
      sphere.position.y - scale, // Altura da linha
      sphere.position.z
    ),
  ];

  var wire = BABYLON.MeshBuilder.CreateLines("wire", { points: wirePoints });

  // Materiais e transparência
  var color = Math.random() * 10;
  var material = new BABYLON.StandardMaterial("material", scene);

  if (color <= 3) {
    material.diffuseColor = new BABYLON.Color3(1, 0, 0); // Vermelho
    material.alpha = 0.7;
    sphere.material = material;
  } else if (color > 3 && color <= 7) {
    material.diffuseColor = new BABYLON.Color3(0, 1, 0); // Verde
    material.alpha = 0.7;
    sphere.material = material;
  } else {
    material.diffuseColor = new BABYLON.Color3(0, 0, 1); // Azul
    material.alpha = 0.7;
    sphere.material = material;
  }

  baloon.addChild(sphere);
  baloon.addChild(wire);

  return baloon;
}

function createTube(name, length, radius, segments) {
  const paths = [];
  for (let t = -length; t <= length; t++) {
    const path = [];
    for (let a = 0; a < 2 * Math.PI; a += Math.PI / segments) {
      let x = radius * Math.cos(a);
      let y = radius * Math.sin(a);
      let z = t;
      path.push(new BABYLON.Vector3(x, y, z));
    }
    path.push(path[0]); // close circle
    paths.push(path);
  }

  const tube = BABYLON.MeshBuilder.CreateRibbon(name, {
    pathArray: paths,
    sideOrientation: BABYLON.Mesh.DOUBLESIDE,
  });
  tube.material = createTexture("textures/wood2.jpg");
  tube.physicsImpostor = makePhysicsObject(tube, "mesh", 0, scene);

  return tube;
}

function createSpiralTube(name, height, radius, curvature) {
  const points = [];
  const stepSize = height / curvature;

  for (let i = -height / 2; i < height / 2; i += stepSize) {
    points.push(
      new BABYLON.Vector3(
        5 * Math.sin((i * curvature) / 400),
        i,
        5 * Math.cos((i * curvature) / 400)
      )
    );
  }

  const spiralTube = BABYLON.MeshBuilder.CreateTube(
    name,
    { path: points, radius: radius, sideOrientation: BABYLON.Mesh.DOUBLESIDE },
    scene
  );
  spiralTube.material = createTexture("textures/wood2.jpg");
  spiralTube.physicsImpostor = makePhysicsObject(spiralTube, "mesh", 0, scene);

  return spiralTube;
}
/********** Fim dos modelos **********/

/******** Início das funções auxiliares */
// Cria a textura para o objeto
function createTexture(path) {
  const material = new BABYLON.StandardMaterial("texture");
  material.diffuseTexture = new BABYLON.Texture(path);
  return material;
}

// Cria a física do objeto
var makePhysicsObject = (object, type, mass, scene) => {
  if (type == "sphere") {
    object.physicsImpostor = new BABYLON.PhysicsImpostor(
      object,
      BABYLON.PhysicsImpostor.SphereImpostor,
      { mass: mass, friction: 0.5, restitution: 0.7 },
      scene
    );
  } else if (type == "box") {
    object.physicsImpostor = new BABYLON.PhysicsImpostor(
      object,
      BABYLON.PhysicsImpostor.BoxImpostor,
      { mass: mass, friction: 0.5, restitution: 0.7 },
      scene
    );
  } else if (type == "cylinder") {
    object.physicsImpostor = new BABYLON.PhysicsImpostor(
      object,
      BABYLON.PhysicsImpostor.CylinderImpostor,
      { mass: mass, friction: 0.5, restitution: 0.7 },
      scene
    );
  } else {
    object.physicsImpostor = new BABYLON.PhysicsImpostor(
      object,
      BABYLON.PhysicsImpostor.MeshImpostor,
      { mass: mass, friction: 0.5, restitution: 0.7 },
      scene
    );
  }
};

// Armazena as posições ou rotações de acordo com o eixo dos objetos, e retorna um array
function getMeshesPosAndRot(meshes, axis, get) {
  var positions = [];

  if (axis == "x") {
    meshes.getChildMeshes().forEach(function (mesh) {
      if (get == "position") {
        positions.push(mesh.position.x);
      } else {
        positions.push(mesh.rotation.x);
      }
    });
  } else if (axis == "y") {
    meshes.getChildMeshes().forEach(function (mesh) {
      if (get == "position") {
        positions.push(mesh.position.y);
      } else {
        positions.push(mesh.rotation.y);
      }
    });
  } else {
    meshes.getChildMeshes().forEach(function (mesh) {
      if (get == "position") {
        positions.push(mesh.position.z);
      } else {
        positions.push(mesh.rotation.z);
      }
    });
  }

  return positions;
}
/********** Fim das funções auxiliares **********/

/********** Início das Animações **********/
// Animação de contração para a mesh especificada
function contractAnimation(meshes, axis, seconds) {
  var firstCount =
    seconds * 1000; /* Recebe os segundos e converte para milisegundos */
  var positions = getMeshesPosAndRot(
    meshes,
    axis,
    "position"
  ); /* Array com as posições ou rotação de cada mesh no eixo especificado */
  var position =
    axis == "y"
      ? meshes.position.y
      : meshes.position.z; /* Posição da mesh no eixo especificado */

  var animation = new BABYLON.Animation(
    "animation",
    /* Posiciona de acordo com o eixo recebido */
    axis == "y" ? "position.y" : "position.z",
    100,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  let keyFrames = [];
  var frame = 0;

  for (i = 4; i >= 0; i--) {
    keyFrames.push({
      frame: frame,
      value: position / i,
    });
    frame += 5;
  }
  animation.setKeys(keyFrames);

  /* Anima cada mesh dentro de um intervalo de tempo + 1 segundo */
  meshes.getChildMeshes().forEach((mesh) => {
    setTimeout(function () {
      scene.beginDirectAnimation(mesh, [animation], 0, 15, true);
    }, (firstCount += 1000));
  });

  var count = 0;
  var secondCount = firstCount;

  /* Retorna cada mesh para sua posição anterior após um período de tempo */
  setTimeout(function () {
    meshes.getChildMeshes().forEach((mesh) => {
      if (axis == "y") {
        mesh.position.y = positions[count];
      } else {
        mesh.position.z = positions[count];
      }
      count++;
    });
  }, (secondCount += 1000));
}

// Animação de rotação para a mesh especificada
function rotationAnimation(meshes, axis, frames, rotationIncrement, loop) {
  var animation = new BABYLON.Animation(
    "animation",
    /* Rotaciona de acordo com o eixo recebido */
    axis == "x" ? "rotation.x" : axis == "y" ? "rotation.y" : "rotation.z",
    100,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    /* Se loop for verdadeiro, a animação é contínua, senão para no último frame */
    loop == true
      ? BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
      : BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  let keyFrames = [];
  var frame = 0;
  var rotation = 0;

  for (i = frames; i >= 0; i--) {
    keyFrames.push({
      frame: frame,
      value:
        /* Rotaciona de acordo com o eixo e a velocidade especificados */
        axis == "x"
          ? meshes.rotation.x + (rotation += rotationIncrement)
          : axis == "y"
          ? meshes.rotation.y + (rotation += rotationIncrement)
          : meshes.rotation.z + (rotation += rotationIncrement),
    });
    frame += 5;
  }

  animation.setKeys(keyFrames);
  scene.beginDirectAnimation(meshes, [animation], 0, (frames - 1) * 5, true);
}

// Cria e inicia a animação do balão
function baloonAnimation(mesh) {
  var animation = new BABYLON.Animation(
    "baloonAnimation",
    "position.y",
    4,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
  ); //CONSTANT
  var keyFrames = [];
  var frame = 0;
  var position = -30;

  for (i = 0; i < 12; i++) {
    keyFrames.push({
      frame: frame,
      value: (position += i),
    });
    frame += 5;
  }

  animation.setKeys(keyFrames);

  scene.beginDirectAnimation(mesh, [animation], 0, frame, true);
}

// Cria e inicia a animação da cachoeira
function waterfallAnimation(size) {
  for (var i = 0; i < size; i++) {
    var particleSystem = new BABYLON.ParticleSystem("particles", 1000, scene);

    particleSystem.particleTexture = new BABYLON.Texture(
      "textures/flare.png",
      scene
    );

    particleSystem.emitter = new BABYLON.Vector3(0, 10, 0 + i); // the starting object, the emitter
    particleSystem.minEmitBox = new BABYLON.Vector3(-2, 0, 0); // Starting all from
    particleSystem.maxEmitBox = new BABYLON.Vector3(2, 0, 0); // To...

    particleSystem.color1 = new BABYLON.Color4(0.7, 0.8, 1.0, 1.0);
    particleSystem.color2 = new BABYLON.Color4(0.2, 0.5, 1.0, 1.0);
    particleSystem.colorDead = new BABYLON.Color4(0, 0, 0.8, 9.0);

    particleSystem.minSize = 0.1;
    particleSystem.maxSize = 0.5;

    particleSystem.minLifeTime = 2;
    particleSystem.maxLifeTime = 3.5;

    particleSystem.emitRate = 300;

    particleSystem.blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

    particleSystem.gravity = new BABYLON.Vector3(0, -9.81, 0);

    particleSystem.direction1 = new BABYLON.Vector3(-2, -8, 2);
    particleSystem.direction2 = new BABYLON.Vector3(0, -8, -0);

    particleSystem.minAngularSpeed = 0;
    particleSystem.maxAngularSpeed = Math.PI;

    particleSystem.minEmitPower = 1;
    particleSystem.maxEmitPower = 3;
    particleSystem.updateSpeed = 0.025;
    particleSystem.start();
  }

  return particleSystem;
}
/********** Fim das animações **********/

/********** Início dos conjuntos de modelos **********/
// Criação do modelo três rampas
function createFirstModel(name, visibleWalls) {
  var firstModel = new BABYLON.Mesh(name);

  var firstRamp = createPlatform(
    "firstRamp",
    1.5,
    6,
    true,
    true,
    false,
    false,
    visibleWalls
  );
  firstRamp.rotation.x = -0.4;
  firstModel.addChild(firstRamp);

  var firstPlatform = createPlatform(
    "firstPlatform",
    2,
    5,
    false,
    true,
    true,
    true,
    visibleWalls
  );
  firstPlatform.rotation.x = 0.25;
  firstPlatform.rotation.y = Math.PI / 2;
  firstPlatform.rotation.z = 0.2;
  firstPlatform.position.x = 1.5;
  firstPlatform.position.y = -2;
  firstPlatform.position.z = -3.95;
  firstModel.addChild(firstPlatform);

  var secondRamp = createPlatform(
    "secondRamp",
    2,
    6,
    true,
    true,
    false,
    false,
    visibleWalls
  );
  secondRamp.rotation.x = 0.4;
  secondRamp.position.x = 3;
  secondRamp.position.y = -4.25;
  firstModel.addChild(secondRamp);

  var secondPlatform = createPlatform(
    "secondPlatform",
    2,
    5,
    false,
    true,
    true,
    true,
    visibleWalls
  );
  secondPlatform.rotation.x = 0.25;
  secondPlatform.rotation.y = -Math.PI / 2;
  secondPlatform.rotation.z = 0.2;
  secondPlatform.position.x = 1.5;
  secondPlatform.position.y = -6.25;
  secondPlatform.position.z = 3.95;
  firstModel.addChild(secondPlatform);

  firstModel.rotation.y = 0.4;
  firstModel.position.x -= 4.05;
  firstModel.position.y -= 4.3;
  firstModel.position.z -= 9.65;

  return firstModel;
}

// Criação do modelo três escadas
function createSecondModel(name, visibleWalls) {
  var secondModel = new BABYLON.Mesh(name);

  var firstStair = createStairs("firstStair", true, true, visibleWalls);
  secondModel.addChild(firstStair);

  var firstPlatform = createPlatform(
    "firstPlatform",
    2,
    4,
    false,
    true,
    true,
    true,
    visibleWalls
  );
  firstPlatform.rotation.x = 0.1;
  firstPlatform.rotation.y = Math.PI / 2;
  firstPlatform.rotation.z = 0.1;
  firstPlatform.position.x = 1.15;
  firstPlatform.position.y = -2.15;
  firstPlatform.position.z = -3.35;
  secondModel.addChild(firstPlatform);

  var secondStair = createStairs("secondStair", true, true, visibleWalls);
  secondStair.rotation.y = Math.PI;
  secondStair.position.x = 2.35;
  secondStair.position.y = -2.65;
  secondStair.position.z = -1.75;
  secondModel.addChild(secondStair);

  var secondPlatform = createPlatform(
    "secondPlatform",
    2,
    4,
    false,
    true,
    true,
    true,
    visibleWalls
  );
  secondPlatform.rotation.x = 0.15;
  secondPlatform.rotation.y = -Math.PI / 2;
  secondPlatform.rotation.z = 0.1;
  secondPlatform.position.x = 1.4;
  secondPlatform.position.y = -4.95;
  secondPlatform.position.z = 1.5;
  secondModel.addChild(secondPlatform);

  secondModel.rotation.y = -0.4;
  secondModel.position.x = 3.14;
  secondModel.position.y -= 3.3;
  secondModel.position.z -= 7.45;

  return secondModel;
}

function createThirdModel(name, visibleWalls) {
  var thirdModel = new BABYLON.Mesh(name);

  var quantity = 24;

  var angle = 0;
  var incAngle = Math.PI / (quantity / 2);
  var radius = 1;
  var x = 0;
  var y = 0;
  var z = 0;

  for (i = 0; i < quantity; i++) {
    x += Math.cos(angle) * radius;
    z -= Math.sin(angle) * radius;

    var platform = createPlatform(
      "platform",
      1.5,
      2,
      false,
      false,
      true,
      true,
      visibleWalls
    );
    platform.rotation.y = angle + 0.1;
    platform.rotation.z -= 0.3;
    platform.position.x = x;
    platform.position.y = y;
    platform.position.z = z;

    angle = angle + incAngle;
    y -= 0.35;

    thirdModel.addChild(platform);
  }

  var baloon = createBaloon(quantity / 6, x, 0, -z - quantity / 6);
  thirdModel.addChild(baloon);
  baloonAnimation(baloon);

  var ramp = createPlatform(
    "ramp",
    1.5,
    5,
    true,
    true,
    false,
    false,
    visibleWalls
  );
  ramp.rotation.x = 0.4;
  ramp.rotation.y = 1.65;
  ramp.position.x -= 2;
  ramp.position.y += 1.15;
  ramp.position.z += 0.25;
  thirdModel.addChild(ramp);

  thirdModel.rotation.y = 0.33;
  thirdModel.position.x += 11;
  thirdModel.position.y -= 5.23;
  thirdModel.position.z -= 4.65;

  return thirdModel;
}

function createFourthModel(name) {
  var fourthModel = new BABYLON.Mesh(name);

  var spiralTube = createSpiralTube("spiralTube", 20, 1, 100);
  fourthModel.addChild(spiralTube);

  //waterfallAnimation(2);

  fourthModel.rotation.y -= 2.75;
  fourthModel.position.x -= 6;
  fourthModel.position.y -= 12.5;
  fourthModel.position.z -= 8;

  return fourthModel;
}

function createFifthModel(name) {
  var fifthModel = new BABYLON.Mesh(name);

  pinbox()

  return fifthModel;
}
/********** Fim dos conjuntos de modelos **********/
