const levelBuilder = {};
levelBuilder.objectiveMaterial = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/6.png")});
levelBuilder.wallMaterial = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/3.png")});
levelBuilder.wallMaterial.map.wrapS = 1000;
levelBuilder.wallMaterial.map.wrapT = 1000;
levelBuilder.wallMaterial.map.repeat.setScalar(8.2);
levelBuilder.floorMaterial = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/4.png")});
levelBuilder.wallMaterial2 = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/5.png")});
levelBuilder.wallMaterial2.map.wrapS = 1000;
levelBuilder.wallMaterial2.map.wrapT = 1000;
levelBuilder.wallMaterial2.map.repeat.setScalar(2);
levelBuilder.blockMaterial = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/7.png")});
levelBuilder.objectiveBlockerMaterial = new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/8.png")});

levelBuilder.init = function () {
  mainGame.scene.background=new THREE.Color("skyblue");
  setTimeout(function(){
    player.character.body.type = 2;
    levelBuilder.backgroundLevel();
  }, 100);
}
levelBuilder.clearScene = function() {
  player.settings.hidden = false;
  delete menuSystem.allowSwitchItems;
  mainGame.scene.children.concat().forEach(function(child) {
    if(child != player.character && child != itemSystem.viewModel) {
      child.removeFromParent();
      if(child.body) {
        physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(child),1);
        physicsSystem.world.remove(child.body);
      }
      if(child.button) {
        physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(child.children[0]),1);
        physicsSystem.world.remove(child.children[0].body);
      }
    }
  });
  portalSystem.portals.concat().forEach(function(portal) {
    portalSystem.portals.splice(portalSystem.portals.indexOf(portal),1);
    if(portal.subcollisions) {
      physicsSystem.world.remove(portal.detector.body);
      physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(portal.detector),1);
      physicsSystem.world.remove(portal.detector2.body);
      physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(portal.detector2),1);
      physicsSystem.world.remove(portal.detector3.body);
      physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(portal.detector3),1);
      portal.subcollisions.forEach(function(e){
        physicsSystem.world.remove(e.body);
        physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(e),1);
      });
      portalPhysics.processed.splice(portalPhysics.processed.indexOf(portal),1);
    }
  });
  player.character.body.type = 2;
}

//LEVEL FEATURES
levelBuilder.buildObjective = function (position,rotation) {
  var objective = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.objectiveMaterial);
  objective.scale.set(2,3.5,0.25);
  objective.position.copy(position);
  objective.rotation.copy(rotation||new THREE.Euler());
  mainGame.scene.add(objective);
  physicsSystem.makeHitbox(objective, true);
  objective.body.collisionResponse = false;
  objective.body.addEventListener("collide", function(e) {
    if(e.body == player.character.body && !objective.done && !objective.blocked) {
      objective.done = true;
      menuSystem.levelJustBeaten = menuSystem.level;
      menuSystem.levelCompleted.style.display = "block";
      menuSystem.level >= localStorage["wormholes.levels"] ? localStorage["wormholes.levels"] = Number(localStorage["wormholes.levels"]) + 1 : 0;
      menuSystem.play("backgroundLevel",true);
      player.character.body.type = 2;
    }
  });
  return objective;
}
levelBuilder.buildButton = function (position, objective, rotation) {
  var button = new THREE.Group();
  button.position.copy(position);
  button.rotation.copy(rotation||new THREE.Euler());
  var base = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.wallMaterial2);
  base.scale.set(2,0.5,2);
  button.add(base);
  var top = new THREE.Mesh(new THREE.CylinderGeometry());
  top.geometry.scale(0.75,1,0.75);
  top.scale.set(1,0.5,1);
  top.position.y = 0.5;
  top.material.color.set("red");
  button.add(top);
  mainGame.scene.add(button);
  physicsSystem.makeHitbox(base, true);
  physicsSystem.makeHitbox(top, true);
  top.body.collisionResponse = false;
  var objectiveBlocker = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.objectiveBlockerMaterial);
  objectiveBlocker.scale.set(3, 5, 1);
  objectiveBlocker.position.copy(objective.position.clone().add(new THREE.Vector3(0,0.7,0)));
  objectiveBlocker.rotation.copy(objective.rotation);
  mainGame.scene.add(objectiveBlocker);
  physicsSystem.makeHitbox(objectiveBlocker, true);
  function buttonLoop() {
    if(button.parent) setTimeout(buttonLoop, 10);
    var guh = true;
    physicsSystem.world.contacts.forEach(function (contact) {
      if(contact.bi == button.children[1].body || contact.bj == button.children[1].body) {
        guh = false;
      }
    });
    if(guh) {
      button.children[1].body.position.y = button.position.y + 0.5;
      if(objectiveBlocker.body.position.y-objective.position.y > 0.9) objectiveBlocker.body.position.y -= 0.2;
      objective.blocked = true;
    } else {
      if(objectiveBlocker.body.position.y-objective.position.y < 4.5) objectiveBlocker.body.position.y += 0.1;
      button.children[1].body.position.y = button.position.y + 0.1;
      objective.blocked = false;
    }
  }
  buttonLoop();
  button.button = true;
  return button;
}

//MAIN LEVELS
levelBuilder.level1 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var random_block = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(random_block);
  random_block.scale.set(2,2,2);
  random_block.position.set(10,1.5,-10);
  random_block.material.color.set("red");
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial1 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial1.png")}));
  mainGame.scene.add(tutorial1);
  tutorial1.scale.set(1.8,1.5,0.1);
  tutorial1.position.set(0,1.5,-3);
  var post = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post);
  post.scale.set(2.5,3,1);
  post.position.set(0,1,-2.5);
  var tutorial2 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial2.png")}));
  mainGame.scene.add(tutorial2);
  tutorial2.scale.set(1.8,1.5,0.1);
  tutorial2.position.set(-3,1.5,14.5);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(random_block); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(post, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(-2, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
}

levelBuilder.level2 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial3 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial3.png")}));
  mainGame.scene.add(tutorial3);
  tutorial3.scale.set(1.8,1.5,0.1);
  tutorial3.position.set(2,1.25,9.5);
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(10,2.5,5);
  wall_5.position.set(0,1,12);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(wall_5, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,4,14.5));
  
  //player positioning
  player.character.body.position.set(-2, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
}

levelBuilder.level3 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var floor2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(floor2);
  floor2.scale.set(20,0.5,5.5);
  floor2.position.set(-4.5,5.5,11.75);
  var floor3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(floor3);
  floor3.scale.set(3,0.5,20);
  floor3.position.set(11,5,11.75);
  var floor4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor4);
  floor4.scale.set(3,0.5,12);
  floor4.position.set(11,2.75,-3.5);
  floor4.rotation.x = -Math.PI/8;
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true); 
  physicsSystem.makeHitbox(floor2, true); 
  physicsSystem.makeHitbox(floor3, true); 
  physicsSystem.makeHitbox(floor4, true); 
  physicsSystem.makeHitbox(ceiling, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(-3,7.5,14.5));
  
  //player positioning
  player.character.body.position.set(5, 2, 0);
}

levelBuilder.level4 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  wall_1.position.y = 10;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  wall_2.position.y = 10;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  wall_3.position.y = 10;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  wall_4.position.y = 10;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 20;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,12,5);
  wall_5.position.set(0,6,12);
  var wall_6 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_6);
  wall_6.scale.set(30,7.5,5);
  wall_6.position.set(0,4,-12);
  var pillar_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_1);
  pillar_1.scale.set(2.5,10,2.5);
  pillar_1.position.set(0,3,-2.5);
  var pillar_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_2);
  pillar_2.scale.set(2.5,10,2.5);
  pillar_2.position.set(3,4,4.5);
  var pillar_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_3);
  pillar_3.scale.set(2.5,10,2.5);
  pillar_3.position.set(-6,6,6);
  var floor2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(floor2);
  floor2.scale.set(3,0.5,15);
  floor2.position.set(11,3.75,-3.25);
  floor2.rotation.x = Math.PI/6;
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(wall_5, true);
  physicsSystem.makeHitbox(wall_6, true);  
  physicsSystem.makeHitbox(pillar_1, true); 
  physicsSystem.makeHitbox(pillar_2, true); 
  physicsSystem.makeHitbox(pillar_3, true); 
  physicsSystem.makeHitbox(floor2, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,13.75,14.5));
  
  //player positioning
  player.character.body.position.set(0, 12, -14.5);
  mainGame.camera.rotation.set(0,Math.PI,0);
}

levelBuilder.level5 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial4 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial4.png")}));
  mainGame.scene.add(tutorial4);
  tutorial4.scale.set(1.8,1.5,0.1);
  tutorial4.position.set(0,1.25,4.5);
  var random_block = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.blockMaterial);
  mainGame.scene.add(random_block);
  random_block.scale.set(1,1,1);
  random_block.position.set(-2,1.5,0);
  var post = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post);
  post.scale.set(2.5,3,1);
  post.position.set(0,1,5);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(random_block);
  physicsSystem.makeHitbox(post, true);
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(-2, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("pickUp");
}

levelBuilder.level6 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var random_block = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.blockMaterial);
  mainGame.scene.add(random_block);
  random_block.scale.set(1,1,1);
  random_block.position.set(0, 1.5,-9);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(random_block);
  
  //goal
  var objective = levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //button
  levelBuilder.buildButton(new THREE.Vector3(0, 0.5, 4), objective);
  
  //player positioning
  player.character.body.position.set(0, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("pickUp");
}

levelBuilder.level7 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var random_block = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(random_block);
  random_block.scale.set(1.3,1.3,1.3);
  random_block.position.y = 1.5;
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var block = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(block);
  block.scale.set(1.3,1.3,1.3);
  block.position.y = 1.5;
  block.position.x = 2;
  var block2 = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(block2);
  block2.scale.set(1.3,1.3,1.3);
  block2.position.y = 1.5;
  block2.position.x = 4;
  var block3 = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(block3);
  block3.scale.set(1.3,1.3,1.3);
  block3.position.y = 1.5;
  block3.position.x = 6;
  var block4 = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(block4);
  block4.scale.set(1.3,1.3,1.3);
  block4.position.y = 1.5;
  block4.position.x = 8;
  var block5 = new THREE.Mesh(new THREE.BoxGeometry(), levelBuilder.blockMaterial);
  mainGame.scene.add(block5);
  block5.scale.set(1.3,1.3,1.3);
  block5.position.y = 1.5;
  block5.position.x = 10;
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(random_block); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true); 
  physicsSystem.makeHitbox(block);
  physicsSystem.makeHitbox(block2);
  physicsSystem.makeHitbox(block3);
  physicsSystem.makeHitbox(block4);
  physicsSystem.makeHitbox(block5);
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,7.2,14.5));
  
  //player positioning
  player.character.body.position.set(0, 2, -5);
  
  //starting item
  itemSystem.switchTo("pickUp");
}

levelBuilder.level8 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial5 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial5.png")}));
  mainGame.scene.add(tutorial5);
  tutorial5.scale.set(1.8,1.5,0.1);
  tutorial5.position.set(0,1.5,-3);
  var post = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post);
  post.scale.set(2.5,3,1);
  post.position.set(0,1,-2.5);
  var post2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post2);
  post2.scale.set(3,6,0.75);
  post2.position.set(-5,1,5.5);
  var post3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post3);
  post3.scale.set(3,6,0.75);
  post3.position.set(-5,1,-2);
  
  //portals
  var a = portalSystem.spawnPortal(false,false,true);
  a.position.set(-5, 1.75, 5.1);
  var b = portalSystem.spawnPortal(a,false,true);
  b.rotation.y = Math.PI;
  b.position.set(-5, 1.75, -1.5);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(post, true); 
  physicsSystem.makeHitbox(post2, true); 
  physicsSystem.makeHitbox(post3, true); 
  portalPhysics.processPortal(a);
  portalPhysics.processPortal(b);
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(-2, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
  player.settings.hidden = true;
}

levelBuilder.level9 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  wall_1.position.y = 10;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  wall_2.position.y = 10;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  wall_3.position.y = 10;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  wall_4.position.y = 10;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 20;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,12,5);
  wall_5.position.set(0,6,12);
  var pillar_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_1);
  pillar_1.scale.set(2.5,10,2.5);
  pillar_1.position.set(0,-2.5,-2.5);
  var pillar_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_2);
  pillar_2.scale.set(2.5,10,2.5);
  pillar_2.position.set(3,-2,4.5);
  var pillar_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_3);
  pillar_3.scale.set(2.5,10,2.5);
  pillar_3.position.set(8,-1,6);
  var pillar_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_4);
  pillar_4.scale.set(2.5,10,2.5);
  pillar_4.position.set(10,0,1);
  var pillar_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_5);
  pillar_5.scale.set(2.5,10,2.5);
  pillar_5.position.set(10.5,2,-3);
  var pillar_6 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_6);
  pillar_6.scale.set(2.5,10,2.5);
  pillar_6.position.set(8.5,4,-6);
  var pillar_7 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(pillar_7);
  pillar_7.scale.set(2.5,10,2.5);
  pillar_7.position.set(-6,4,-6);
  
  //portals
  var a = portalSystem.spawnPortal(false,false,true);
  a.position.set(-14.2, 10, -6);
  a.rotation.y = -Math.PI/2;
  var b = portalSystem.spawnPortal(a,false,true);
  b.position.set(5, 14, 14.2);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(wall_5, true);
  physicsSystem.makeHitbox(pillar_1, true); 
  physicsSystem.makeHitbox(pillar_2, true); 
  physicsSystem.makeHitbox(pillar_3, true); 
  physicsSystem.makeHitbox(pillar_4, true); 
  physicsSystem.makeHitbox(pillar_5, true);
  physicsSystem.makeHitbox(pillar_6, true);
  physicsSystem.makeHitbox(pillar_7, true);
  portalPhysics.processPortal(a);
  portalPhysics.processPortal(b);
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,13.75,14.5));
  
  //player positioning
  player.character.body.position.set(0, 2, -14.5);
  mainGame.camera.rotation.set(0,Math.PI,0);
}

levelBuilder.level10 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial6 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial6.png")}));
  mainGame.scene.add(tutorial6);
  tutorial6.scale.set(1.8,1.5,0.1);
  tutorial6.position.set(0,1.5,-3);
  var post = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post);
  post.scale.set(2.5,3,1);
  post.position.set(0,1,-2.5);
  var post2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post2);
  post2.scale.set(8,6,1.5);
  post2.position.set(-5,1,5.5);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(post, true); 
  physicsSystem.makeHitbox(post2, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(-2, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("wormholeGun");
}

levelBuilder.level11 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var floor2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(floor2);
  floor2.scale.set(10,0.5,10);
  floor2.position.set(0, 6, 10);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(floor2,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,8,14.5));
  
  //player positioning
  player.character.body.position.set(5, 2, 0);
  
  //starting item
  itemSystem.switchTo("wormholeGun");
}

levelBuilder.level12 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,8,1);
  wall_5.position.set(0, 5.5, 0);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_5,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(5, 2, -5);
  
  //starting item
  itemSystem.switchTo("wormholeGun");
}

levelBuilder.level13 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,8,1);
  wall_5.position.set(0, 4, 0);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_5,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true); 
  physicsSystem.makeHitbox(ceiling, true); 
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,4,14.5));
  
  //player positioning
  player.character.body.position.set(5, 2, -5);
  
  //starting item
  itemSystem.switchTo("wormholeGun");
}

levelBuilder.level14 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  var tutorial7 = new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial({map:mainGame.textureLoader.load("textures/tutorial/tutorial7.png")}));
  mainGame.scene.add(tutorial7);
  tutorial7.scale.set(1.8,1.5,0.1);
  tutorial7.position.set(0,1.5,5);
  var post = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(post);
  post.scale.set(2.5,3,1);
  post.position.set(0,1,5.5);
  var random_block = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.blockMaterial);
  mainGame.scene.add(random_block);
  random_block.scale.set(1,1,1);
  random_block.position.set(0,1.5,0);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(post, true); 
  physicsSystem.makeHitbox(random_block);
  
  //goal
  levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //player positioning
  player.character.body.position.set(0, 2, -7);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("pickUp");
  menuSystem.allowSwitchItems = ["pickUp", "wormholeGun"];
}

levelBuilder.level15 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  wall_1.position.y = 10;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  wall_2.position.y = 10;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  wall_3.position.y = 10;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  wall_4.position.y = 10;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 20;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,12,0.5);
  wall_5.position.set(0,6,-9.75);
  var wall_6 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_6);
  wall_6.scale.set(30,12,0.5);
  wall_6.position.set(2,18,-9.75);
  var wall_7 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_7);
  wall_7.scale.set(0.5,12,5);
  wall_7.position.set(-10,6,-12.5);
  var wall_8 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(wall_8);
  wall_8.scale.set(0.5,12,5);
  wall_8.position.set(10,6,-12.5);
  var wall_9 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(wall_9);
  wall_9.scale.set(5,0.5,5);
  wall_9.position.set(-12.5,12,-12.5);
  var wall_10 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial2);
  mainGame.scene.add(wall_10);
  wall_10.scale.set(5,0.5,5);
  wall_10.position.set(12.5,12,-12.5);
  var block = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.blockMaterial);
  mainGame.scene.add(block);
  block.scale.set(1,1,1);
  block.position.set(14,12,-12);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(wall_5, true);
  physicsSystem.makeHitbox(wall_6, true);
  physicsSystem.makeHitbox(wall_7, true);
  physicsSystem.makeHitbox(wall_8, true);
  physicsSystem.makeHitbox(wall_9, true);
  physicsSystem.makeHitbox(wall_10, true);
  physicsSystem.makeHitbox(block);
  
  //goal
  var objective = levelBuilder.buildObjective(new THREE.Vector3(0,2,14.5));
  
  //button
  levelBuilder.buildButton(new THREE.Vector3(0, 0.75, -2), objective);
  
  //player positioning
  player.character.body.position.set(0, 2, -8);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("pickUp");
  menuSystem.allowSwitchItems = ["pickUp", "wormholeGun"];
}

levelBuilder.level16 = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  wall_1.position.y = 10;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  wall_2.position.y = 10;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  wall_3.position.y = 10;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  wall_4.position.y = 10;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 20;
  var wall_5 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_5);
  wall_5.scale.set(30,0.5,30);
  wall_5.position.set(0,15,3);
  var wall_6 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_6);
  wall_6.scale.set(30,0.5,30);
  wall_6.position.set(3.7,15.001,-26);
  var block = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.blockMaterial);
  mainGame.scene.add(block);
  block.scale.set(1,1,1);
  block.position.set(0, 0.75, -2);
  var floor_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor_2);
  floor_2.scale.set(100,0.5,100);
  floor_2.position.set(0,4,-37);
  var floor_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor_3);
  floor_3.scale.set(100,0.5,100);
  floor_3.position.set(-37,4,63);
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  physicsSystem.makeHitbox(wall_5, true);
  physicsSystem.makeHitbox(wall_6, true);
  physicsSystem.makeHitbox(ceiling, true);
  physicsSystem.makeHitbox(block);
  physicsSystem.makeHitbox(floor_2,true);
  physicsSystem.makeHitbox(floor_3,true);
  
  //goal
  var objective = levelBuilder.buildObjective(new THREE.Vector3(0,6,14.5));
  
  //button
  levelBuilder.buildButton(new THREE.Vector3(0,15.75,0), objective);
  
  //player positioning
  player.character.body.position.set(0, 6, -8);
  mainGame.camera.rotation.set(0,Math.PI,0);
  
  //starting item
  itemSystem.switchTo("pickUp");
  menuSystem.allowSwitchItems = ["pickUp", "wormholeGun"];
}

//BACKGROUND LEVEL
levelBuilder.backgroundLevel = function () {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.floorMaterial);
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_1);
  wall_1.scale.set(30,20,1);
  wall_1.position.z = 15;
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_2);
  wall_2.scale.set(30,20,1);
  wall_2.position.z = -15;
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_3);
  wall_3.scale.set(1,20,30);
  wall_3.position.x = 15;
  var wall_4 = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(wall_4);
  wall_4.scale.set(1,20,30);
  wall_4.position.x = -15;
  var ceiling = new THREE.Mesh(new THREE.BoxGeometry(),levelBuilder.wallMaterial);
  mainGame.scene.add(ceiling);
  ceiling.scale.set(30,1,30);
  ceiling.position.y = 10;
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); 
  physicsSystem.makeHitbox(wall_1, true); 
  physicsSystem.makeHitbox(wall_2, true); 
  physicsSystem.makeHitbox(wall_3, true); 
  physicsSystem.makeHitbox(wall_4, true);
  
  //portals
  var a = portalSystem.spawnPortal(false,false,true);
  a.rotation.y = Math.PI;
  a.position.set(-5, 2, -14.2);
  var b = portalSystem.spawnPortal(a,false,true);
  b.rotation.y = -Math.PI/2;
  b.position.set(-14.2, 2, -10);
  
  //player positioning
  player.character.body.position.set(0, 2, 0);
  mainGame.camera.rotation.set(0,Math.PI/6,0);
}

//TESTING LEVELS
levelBuilder.originalTestingLevel = function() {
  //map
  var floor = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(floor);
  floor.scale.set(100,0.5,100);
  mainGame.scene.background=new THREE.Color("skyblue");
  var random_block = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(random_block);
  random_block.scale.set(2,2,2);
  random_block.position.y = 1.5;
  random_block.material.color.set("red");
  var wall_1 = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(wall_1);
  wall_1.scale.set(10,10,1);
  wall_1.position.z = 12;
  wall_1.material.color.set("lime");
  var pillar = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(pillar);
  pillar.scale.set(1,3,1);
  pillar.position.set(3,1,2)
  pillar.material.color.set("blue");
  var pillar_2 = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(pillar_2);
  pillar_2.scale.set(1,3,1);
  pillar_2.position.set(3,1,8.55)
  pillar_2.material.color.set("blue");
  var wall_2 = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(wall_2);
  wall_2.scale.set(10,10,1);
  wall_2.position.z = -10;
  wall_2.material.color.set("pink");
  var wall_3 = new THREE.Mesh(new THREE.BoxGeometry());
  mainGame.scene.add(wall_3);
  wall_3.scale.set(10,10,1);
  wall_3.position.z = 30;
  wall_3.material.color.set("blue");
  
  //portals
  portalSystem.spawnPortal(false,false,true);
  portalSystem.spawnPortal(portalSystem.portals[0],false,true);
  portalSystem.portals[0].position.set(3,1.75,2.55);
  portalSystem.portals[1].position.set(3,1.75,8);
  portalSystem.portals[0].rotation.y=Math.PI;
  
  portalSystem.spawnPortal(false,false,true);
  portalSystem.spawnPortal(portalSystem.portals[2],false,true);
  portalSystem.portals[2].position.set(-3,1.75,11.45);
  portalSystem.portals[3].position.set(1,1.75,11.45);
  
  //camera
  mainGame.camera.position.set(0,10,-10);
  //mainGame.controls.target.y = 3;
  
  //hitboxes
  physicsSystem.makeHitbox(floor,true); //true is for frozen in place
  physicsSystem.makeHitbox(random_block,false);
  physicsSystem.makeHitbox(wall_1,true);
  physicsSystem.makeHitbox(pillar,true);
  physicsSystem.makeHitbox(pillar_2,true);
  physicsSystem.makeHitbox(wall_2,true);
  physicsSystem.makeHitbox(wall_3,true);
  portalPhysics.processPortal(portalSystem.portals[0]);
  portalPhysics.processPortal(portalSystem.portals[1]);
  portalPhysics.processPortal(portalSystem.portals[3]);
  portalPhysics.processPortal(portalSystem.portals[2]);
  
  //starting item
  itemSystem.switchTo("wormholeGun");
}