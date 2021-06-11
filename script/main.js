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

  createRubeGoldbergMachine(scene);

  setTimeout(function () {
    sphere = BABYLON.MeshBuilder.CreateSphere("sphere", scene);
    //sphere.position.x = 2;
    sphere.position.y = 1;
    sphere.position.z = -0.3;
    sphere.physicsImpostor = makePhysicsObject(sphere, "sphere", 1, scene);
  }, 2000);

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
function createRubeGoldbergMachine(scene) {
  var rubeGoldbergMachine = new BABYLON.Mesh("RubeGoldbergMachine");

  // var firstModel = createFirstModel("firstModel");
  // rubeGoldbergMachine.addChild(firstModel);

  var secondModel = createSecondModel("secondModel");
  rubeGoldbergMachine.addChild(secondModel);

  return rubeGoldbergMachine;
}

// Criação do modelo três rampas
function createFirstModel(name) {
  var firstModel = new BABYLON.Mesh(name);

  var firstRamp = createPlatform("firstRamp", 2, 6, true, true, false, false);
  firstRamp.rotation.x = -0.5;
  firstModel.addChild(firstRamp);

  var firstPlatform = createPlatform(
    "firstPlatform",
    2,
    5,
    false,
    true,
    true,
    true
  );
  firstPlatform.rotation.x = 0.25;
  firstPlatform.rotation.y = Math.PI / 2;
  firstPlatform.position.x = 1.5;
  firstPlatform.position.y = -2;
  firstPlatform.position.z = -3.95;
  firstModel.addChild(firstPlatform);

  var secondRamp = createPlatform("secondRamp", 2, 6, true, true, false, false);
  secondRamp.rotation.x = 0.5;
  secondRamp.position.x = 3;
  secondRamp.position.y = -4.5;
  firstModel.addChild(secondRamp);

  var firstPlatform = createPlatform(
    "firstPlatform",
    2,
    5,
    false,
    true,
    true,
    true
  );
  firstPlatform.rotation.x = 0.25;
  firstPlatform.rotation.y = -Math.PI / 2;
  firstPlatform.position.x = 1.5;
  firstPlatform.position.y = -6.75;
  firstPlatform.position.z = 3.95;
  firstModel.addChild(firstPlatform);

  return firstModel;
}

// Criação do modelo três escadas
function createSecondModel(name) {
  var secondModel = new BABYLON.Mesh(name);

  var firstStair = createStairs("firstStair", 10, 0.35, 2, 0.5);
  secondModel.addChild(firstStair);

  var firstPlatform = createPlatform(
    "firstPlatform",
    2,
    6,
    false,
    true,
    true,
    true
  );
  firstPlatform.rotation.x = 0.15;
  firstPlatform.rotation.y = Math.PI / 2;
  firstPlatform.position.x = 1.8;
  firstPlatform.position.y = -3.85;
  firstPlatform.position.z = -5.8;
  secondModel.addChild(firstPlatform);

  var secondStair = createStairs("secondStair", 10, 0.35, 2, 0.5);
  secondStair.rotation.y = Math.PI;
  secondStair.position.x = 3.65;
  secondStair.position.y = -4.5;
  secondStair.position.z = -4.5;
  secondModel.addChild(secondStair);

  var secondPlatform = createPlatform(
    "secondPlatform",
    2,
    6,
    false,
    true,
    true,
    true
  );
  secondPlatform.rotation.x = 0.15;
  secondPlatform.rotation.y = -Math.PI / 2;
  secondPlatform.position.x = 1.8;
  secondPlatform.position.y = -8;
  secondPlatform.position.z = 1.35;
  secondModel.addChild(secondPlatform);

  return secondModel;
}

// Cria uma plataforma utilizando boxes e aplicando física
function createPlatform(
  name,
  width,
  depth,
  limitLeft,
  limitRight,
  limitBottom,
  limitUp
) {
  var platform = new BABYLON.Mesh(name);

  var ground = BABYLON.MeshBuilder.CreateBox(
    "ground",
    { height: 0.1, width: width, depth: depth },
    scene
  );
  ground.physicsImpostor = makePhysicsObject(ground, "box", 0, scene);
  ground.material = createTexture("textures/wood2.jpg");
  platform.addChild(ground);

  if (limitLeft) {
    var boxLeft = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: 0.35, depth: depth },
      scene
    );
    boxLeft.position.x = -width / 1.8;
    boxLeft.position.y = 0.12;
    boxLeft.material = createTexture("textures/wood1.jpg");
    boxLeft.physicsImpostor = makePhysicsObject(boxLeft, "box", 0, scene);
    platform.addChild(boxLeft);
  }

  if (limitRight) {
    var boxRight = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: 0.35, depth: depth },
      scene
    );
    boxRight.position.x = width / 1.8;
    boxRight.position.y = 0.12;
    boxRight.material = createTexture("textures/wood1.jpg");
    boxRight.physicsImpostor = makePhysicsObject(boxRight, "box", 0, scene);
    platform.addChild(boxRight);
  }

  if (limitBottom) {
    var boxBottom = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width, depth: 0.35 },
      scene
    );
    boxBottom.position.z = -depth / 1.9;
    boxBottom.position.y = 0.12;
    boxBottom.material = createTexture("textures/wood1.jpg");
    boxBottom.physicsImpostor = makePhysicsObject(boxBottom, "box", 0, scene);
    platform.addChild(boxBottom);
  }

  if (limitUp) {
    var boxUp = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.75, width: width, depth: 0.35 },
      scene
    );
    boxUp.position.z = depth / 1.9;
    boxUp.position.y = 0.12;
    boxUp.material = createTexture("textures/wood1.jpg");
    boxUp.physicsImpostor = makePhysicsObject(boxUp, "box", 0, scene);
    platform.addChild(boxUp);
  }

  return platform;
}

function createGroundCurve(name) {
  var groundCurve = new BABYLON.Mesh(name);

  var ground = BABYLON.Mesh.CreateGround("ground1", 2, 2, 2, scene);
  ground.physicsImpostor = makePhysicsObject(ground, "box", 0, scene);
  ground.material = createTexture("textures/wood2.jpg");
  groundCurve.addChild(ground);

  var boxLeft = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.5, width: 0.5, depth: 2 },
    scene
  );
  boxLeft.position.x = -1.05;
  boxLeft.material = createTexture("textures/wood1.jpg");
  boxLeft.physicsImpostor = makePhysicsObject(boxLeft, "box", 0, scene);
  groundCurve.addChild(boxLeft);

  var boxTop = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.5, width: 2.3, depth: 0.5 },
    scene
  );
  boxTop.position.x = -0.15;
  boxTop.position.z = 1.1;
  boxTop.material = createTexture("textures/wood1.jpg");
  boxTop.physicsImpostor = makePhysicsObject(boxTop, "box", 0, scene);
  groundCurve.addChild(boxTop);

  var boxRight = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.5, width: 0.5, depth: 0.75 },
    scene
  );
  boxRight.position.x = 1.05;
  boxRight.position.z = -0.65;
  boxRight.material = createTexture("textures/wood1.jpg");
  boxRight.physicsImpostor = makePhysicsObject(boxRight, "box", 0, scene);
  groundCurve.addChild(boxRight);

  return groundCurve;
}

function createCapsuleRamp(name, depth) {
  var capsuleRamp = new BABYLON.Mesh(name);

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
  capsuleRamp.addChild(capsuleLeft);

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
  capsuleRamp.addChild(capsuleRight);

  return capsuleRamp;
}

// Cria uma escada de boxes com a quantidade de degraus específicada e suas dimensões
function createStairs(name, steps, height, width, depth) {
  var simpleStairs = new BABYLON.Mesh(name);
  var box;
  var posY = 0;
  var posZ = 0;

  for (var i = 0; i < steps; i++) {
    box = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: height, width: width, depth: depth },
      scene
    );
    box.position.y = posY;
    box.position.z = posZ;
    box.material = createTexture("textures/wood2.jpg");
    box.physicsImpostor = makePhysicsObject(box, "box", 0, scene);
    simpleStairs.addChild(box);

    posY -= height;
    posZ -= depth;
  }

  return simpleStairs;
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

// Cria a textura para o objeto
function createTexture(path) {
  const material = new BABYLON.StandardMaterial("texture");
  material.diffuseTexture = new BABYLON.Texture(path);
  return material;
}

function seesaw(scale, posX, posY, posZ) {
  var b = BABYLON.MeshBuilder.CreateBox("topoFundo", {
    width: 7 * scale,
    height: 0.2 * scale,
    depth: 1 * scale,
  });
  b.position.x = posX;
  b.position.y = posY;
  b.position.z = posZ;
  b.PhysicsImpostor = new BABYLON.PhysicsImpostor(
    b,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 2 },
    scene
  );
  //b.rotation.x+=Math.PI/2

  var mat = new BABYLON.StandardMaterial("metalic", scene);
  mat.diffuseTexture = new BABYLON.Texture("textures/wood2.jpg", scene);
  b.material = mat;

  var c = BABYLON.MeshBuilder.CreateBox("topoFundo", {
    width: 1 * scale,
    height: 1 * scale,
    depth: 1 * scale,
  });
  c.position.x = posX;
  c.position.y = posY - 1;
  c.position.z = posZ;
  c.rotation.x += Math.PI / 4;
  c.rotation.y += Math.PI / 2;

  c.PhysicsImpostor = new BABYLON.PhysicsImpostor(
    c,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 0 },
    scene
  );

  var joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
    mainPivot: new BABYLON.Vector3(0, 0, 0),
    connectedPivot: new BABYLON.Vector3(0, -1, 0),
    mainAxis: new BABYLON.Vector3(0, 0, 0),
    connectedAxis: new BABYLON.Vector3(0, 0, 1),
  });

  c.PhysicsImpostor.addJoint(b.PhysicsImpostor, joint);
}

function domino(scale, posX, posY, posZ) {
  var material = new BABYLON.StandardMaterial("dominoTexture");
  material.diffuseTexture = new BABYLON.Texture("/textures/domino.png");

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

  domino.material = material;

  domino.physicsImpostor = new BABYLON.PhysicsImpostor(
    domino,
    BABYLON.PhysicsImpostor.BoxImpostor,
    { mass: 1 },
    scene
  );
}

function baloon(scale, posX, posY, posZ) {
  var b = BABYLON.MeshBuilder.CreateSphere("baloon", {
    diameter: 1 * scale,
    segments: 32,
  });

  b.position.x = posX;
  b.position.y = posY;
  b.position.z = posZ;

  //pontos
  const p = [
    //ponto inicio
    new BABYLON.Vector3(
      b.position.x,
      b.position.y - scale / 2, //inicia na base da esfera
      b.position.z
    ),
    //ponto fim
    new BABYLON.Vector3(
      b.position.x,
      b.position.y - 5, //comprimento da linha
      b.position.z
    ),
  ];

  var fio = BABYLON.MeshBuilder.CreateLines("fio", { points: p });

  var n = Math.random() * 10;
  var mat = new BABYLON.StandardMaterial("material", scene);
  if (n <= 3) {
    mat.diffuseColor = new BABYLON.Color3(1, 0, 0); //vemelho
    mat.alpha = 0.7;
    b.material = mat;
  } else if (n > 3 && n <= 7) {
    mat.diffuseColor = new BABYLON.Color3(0, 1, 0); //verde
    mat.alpha = 0.7;
    b.material = mat;
  } else {
    mat.diffuseColor = new BABYLON.Color3(0, 0, 1); //azul
    mat.alpha = 0.7;
    b.material = mat;
  }
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
