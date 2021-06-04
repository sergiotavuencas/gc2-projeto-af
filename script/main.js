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

  scene.enablePhysics(
    new BABYLON.Vector3(0, -9.8, 0),
    new BABYLON.CannonJSPlugin(false)
  );

  var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", { size: 2 }, scene);
  sphere.position.y = 2.5;
  sphere.physicsImpostor = makePhysicsObject(sphere, "sphere", 1, scene);

  createRampStairs("stairs", 5, 0.5);

  return scene;
};

function createCamera() {
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    -Math.PI / 2,
    Math.PI / 2.5,
    15,
    new BABYLON.Vector3(0, 0, 5)
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

function createGroundRamp(name, depth) {
  var groundRamp = new BABYLON.Mesh(name);

  var ground = BABYLON.Mesh.CreateGround("ground1", 2, depth, 2, scene);
  ground.physicsImpostor = makePhysicsObject(ground, "box", 0, scene);
  ground.material = createTexture("textures/wood2.jpg");
  groundRamp.addChild(ground);

  var boxLeft = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.35, width: 0.5, depth: depth },
    scene
  );
  boxLeft.position.x = -1.05;
  boxLeft.position.y = 0.08;
  boxLeft.material = createTexture("textures/wood1.jpg");
  boxLeft.physicsImpostor = makePhysicsObject(boxLeft, "box", 0, scene);
  groundRamp.addChild(boxLeft);

  var boxRight = BABYLON.MeshBuilder.CreateBox(
    "box",
    { height: 0.35, width: 0.5, depth: depth },
    scene
  );
  boxRight.position.x = 1.05;
  boxRight.position.y = 0.08;
  boxRight.material = createTexture("textures/wood1.jpg");
  boxRight.physicsImpostor = makePhysicsObject(boxRight, "box", 0, scene);
  groundRamp.addChild(boxRight);

  return groundRamp;
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

function createSimpleStairs(name, steps, yDistance) {
  var simpleStairs = new BABYLON.Mesh(name);
  var box;
  var posY = 0;
  var posZ = 0;

  for (var i = 0; i < steps; i++) {
    box = BABYLON.MeshBuilder.CreateBox(
      "box",
      { height: 0.5, width: 2.5, depth: 0.5 },
      scene
    );
    box.position.y = posY;
    box.position.z = posZ;
    box.material = createTexture("textures/concrete.jpg");
    box.physicsImpostor = makePhysicsObject(box, "box", 0, scene);
    simpleStairs.addChild(box);

    posY -= yDistance;
    posZ -= 0.5;
  }

  return simpleStairs;
}

function createRampStairs(name, steps, zDistance) {
  var rampStairs = new BABYLON.Mesh(name);
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
    cylinder.rotation.x = -0.1;
    cylinder.material = createTexture("textures/glass.jpg");
    cylinder.alpha=0.1;
    cylinder.physicsImpostor = makePhysicsObject(
      cylinder,
      "cylinder",
      0,
      scene
    );
    rampStairs.addChild(cylinder);

    posY -= 0.15;
    posZ -= zDistance;
  }

  return rampStairs;
}

function createTexture(path) {
  const material = new BABYLON.StandardMaterial("texture");
  material.diffuseTexture = new BABYLON.Texture(path);
  return material;
}

function seesaw(scale,posX,posY,posZ){
  var b = BABYLON.MeshBuilder.CreateBox("topoFundo",{
      width:7*scale,
      height:0.2*scale,
      depth:1*scale
  });
  b.position.x = posX;
  b.position.y = posY;
  b.position.z = posZ;
  b.PhysicsImpostor = new BABYLON.PhysicsImpostor(b,BABYLON.PhysicsImpostor.BoxImpostor,{mass: 2},scene)
  //b.rotation.x+=Math.PI/2

  var mat = new BABYLON.StandardMaterial("metalic", scene);
  mat.diffuseTexture = new BABYLON.Texture("textures/wood2.jpg", scene);
  b.material = mat;
  
var c = BABYLON.MeshBuilder.CreateBox("topoFundo",{
      width:1*scale,
      height:1*scale,
      depth:1*scale
  });
  c.position.x = posX;
  c.position.y = posY-1;
  c.position.z = posZ;
  c.rotation.x+=Math.PI/4
  c.rotation.y+=Math.PI/2

  c.PhysicsImpostor = new BABYLON.PhysicsImpostor(c,BABYLON.PhysicsImpostor.BoxImpostor,{mass: 0},scene)
  
  var joint = new BABYLON.PhysicsJoint(BABYLON.PhysicsJoint.HingeJoint, {
  mainPivot: new BABYLON.Vector3(0, 0, 0),
      connectedPivot: new BABYLON.Vector3(0, -1, 0),
      mainAxis: new BABYLON.Vector3(0, 0, 0),
      connectedAxis: new BABYLON.Vector3(0, 0, 1),
  }); 

  c.PhysicsImpostor.addJoint(b.PhysicsImpostor,joint)
}
function domino(scale,posX,posY,posZ){

  var material = new BABYLON.StandardMaterial("dominoTexture");
  material.diffuseTexture = new BABYLON.Texture("/textures/domino.png");
  
  const faceUV = [];
  faceUV[2] = new BABYLON.Vector4(0.0, 0.0, 1.0, 1.0); //rear face
  faceUV[3] = new BABYLON.Vector4(0.0, 0.0, 1.0, 1.0); //front face
  
  faceUV[0] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0); 
  faceUV[1] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0); 
  faceUV[4] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0); 
  faceUV[5] = new BABYLON.Vector4(0.0, 0.0, 0.0, 0.0); 

  var domino = BABYLON.MeshBuilder.CreateBox("domino",{
      width:0.3*scale,
      height:2*scale,
      depth:1*scale,
      faceUV: faceUV
  });

  domino.position.x = posX; 
  domino.position.y = posY+scale;
  domino.position.z = posZ;

  domino.material = material;

  domino.physicsImpostor = new BABYLON.PhysicsImpostor(
      domino, 
      BABYLON.PhysicsImpostor.BoxImpostor, 
      {mass: 1},
      scene);
}

function baloon(scale,posX,posY,posZ){
  var b = BABYLON.MeshBuilder.CreateSphere("baloon",{
      diameter:1*scale,
      segments:32 
  });

  b.position.x = posX;
  b.position.y = posY;
  b.position.z = posZ;
  
  //pontos
  const p = [
      //ponto inicio
      new BABYLON.Vector3(
          b.position.x,
          b.position.y-(scale/2),//inicia na base da esfera
          b.position.z
          ),
      //ponto fim
      new BABYLON.Vector3(
          b.position.x,
          b.position.y-5,//comprimento da linha
          b.position.z
          )
  ]

  var fio = BABYLON.MeshBuilder.CreateLines("fio",{points:p});

  var n = Math.random()*10;
  var mat = new BABYLON.StandardMaterial("material", scene);
  if(n<=3){
      mat.diffuseColor = new BABYLON.Color3(1, 0, 0);//vemelho
      mat.alpha = 0.7;	
      b.material = mat;
  }
  else if(n>3 && n<=7){
      mat.diffuseColor = new BABYLON.Color3(0, 1, 0);//verde
      mat.alpha = 0.7;	
      b.material = mat;
  }else{
      mat.diffuseColor = new BABYLON.Color3(0, 0, 1);//azul
      mat.alpha = 0.7;
      b.material = mat;
  }

}

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

var makePhysicsMeshes = (newMeshes, scene, scaling) => {
  var physicsRoot = new BABYLON.Mesh("physicsRoot", scene);
  physicsRoot.position.y -= 0.9;

  newMeshes.forEach((m) => {
    if (m.name.indexOf("box") != -1) {
      m.isVisible = false;
      physicsRoot.addChild(m);
    }
  });

  newMeshes.forEach((m, i) => {
    if (m.parent == null) {
      physicsRoot.addChild(m);
    }
  });

  physicsRoot.getChildMeshes().forEach((m) => {
    if (m.name.indexOf("box") != -1) {
      m.scaling.x = Math.abs(m.scaling.x);
      m.scaling.y = Math.abs(m.scaling.y);
      m.scaling.z = Math.abs(m.scaling.z);
      m.physicsImpostor = new BABYLON.PhysicsImpostor(
        m,
        BABYLON.PhysicsImpostor.SphereImpostor,
        { mass: 0.1 },
        scene
      );
    }
  });

  physicsRoot.scaling.scaleInPlace(scaling);
  physicsRoot.physicsImpostor = new BABYLON.PhysicsImpostor(
    physicsRoot,
    BABYLON.PhysicsImpostor.NoImpostor,
    { mass: 3 },
    scene
  );

  return physicsRoot;
};