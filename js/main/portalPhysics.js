const portalPhysics = {};
portalPhysics.processed = [];
portalPhysics.raycaster = new THREE.Raycaster();
portalPhysics.lastCollide = -Infinity;
portalPhysics.lastTeleport = 0;

portalPhysics.processPortal = function (portal) {
  if(portal.processed) return;
  var thing = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial({color:"purple"}));
  thing.scale.set(1,0.2,2);
  thing.position.set(0,-0.6,0.5)
  thing.rotation.x = -0.1;
  thing.visible=false;
  portal.add(thing);
  physicsSystem.makeHitbox(thing, true);
  var thing2 = thing.clone();
  thing2.scale.set(1,0.2,1.5);
  thing2.position.y = 0.5;
  thing2.position.z += 0;
  thing2.rotation.x = Math.PI;
  portal.add(thing2);
  physicsSystem.makeHitbox(thing2, true);
  var thing3 = thing.clone();
  thing3.scale.set(1,0.2,2);
  thing3.position.set(0.5,0,0.5);
  thing3.rotation.set(0,0,Math.PI/2);
  portal.add(thing3);
  physicsSystem.makeHitbox(thing3, true);
  var thing4 = thing.clone();
  thing4.scale.set(1,0.2,2);
  thing4.position.set(-0.5,0,0.5);
  thing4.rotation.set(0,0,Math.PI/2);
  portal.add(thing4);
  physicsSystem.makeHitbox(thing4, true);
  portal.processed = true;
  portal.subcollisions = [thing,thing2,thing3,thing4];
  portal.detector = thing.clone();
  portal.add(portal.detector);
  portal.detector.scale.set(0.5,0.5,1.25);
  portal.detector.position.set(0,0,-0.3);
  portal.detector.rotation.set(0,0,0);
  physicsSystem.makeHitbox(portal.detector, true);
  portal.detector.body.collisionResponse = false;
  portal.detector2 = thing.clone();
  portal.add(portal.detector2);
  portal.detector2.scale.set(0.5,0.7,0.1);
  portal.detector2.position.set(0,0,-0.85);
  portal.detector2.rotation.set(0,0,0);
  physicsSystem.makeHitbox(portal.detector2, true);
  portal.detector2.body.collisionResponse = false;
  portalPhysics.disableCollisions(portal);
  portal.detector3 = thing.clone();
  portal.add(portal.detector3);
  portal.detector3.scale.set(1,1,1);
  portal.detector3.position.set(0,0,0);
  portal.detector3.rotation.set(0,0,0);
  physicsSystem.makeHitbox(portal.detector3, true);
  portal.detector3.body.collisionResponse = false;
  portalPhysics.disableCollisions(portal);
  portalPhysics.processed.push(portal);
}

portalPhysics.disableCollisions = function (portal) {
  if(portal.processed) {
    portal.subcollisions.forEach(function(e){
      e.body.collisionResponse = false;
    });
  }
}

portalPhysics.enableCollisions = function (portal) {
  if(portal.processed) {
    portal.subcollisions.forEach(function(e){
      e.body.collisionResponse = true;
    });
  }
}

portalPhysics.update = function () {
  portalPhysics.processed.forEach(function(portal) {
    if(!portal.backCollision) {
      var direction = new THREE.Vector3();
      portal.getWorldDirection(direction);
      direction.multiplyScalar(-1);
      portalPhysics.raycaster.set(portal.position, direction);
      var guh = mainGame.scene.children.concat()
      guh.splice(mainGame.scene.children.indexOf(portal),1);
      var results = portalPhysics.raycaster.intersectObjects(guh,false);
      if(!results[0] || !results[0].object.body || results[0].distance > 0.5) return;
      portal.backCollision = results[0].object;
      portal.backCollision.normal=results[0].face.normal;
    }
    var a = player.character.body.aabb.clone();
    a.lowerBound.vadd(player.character.body.position,a.lowerBound);
    a.upperBound.vadd(player.character.body.position,a.upperBound);
    var b = portal.detector.body.aabb.clone();
    b.lowerBound.vadd(portal.detector.body.position,b.lowerBound);
    b.upperBound.vadd(portal.detector.body.position,b.upperBound);
    var c = portal.detector.body.aabb.clone();
    c.lowerBound.vadd(portal.detector2.body.position,c.lowerBound);
    c.upperBound.vadd(portal.detector2.body.position,c.upperBound);
    if(a.overlaps(b)) {
      if(!portal.counterpart) return;
      portalPhysics.enableCollisions(portal);
      if(!portal.backCollisionHandled) {
        portal.backCollisionHandled = true;
        if(!portal.backCollision.normal.equals(new THREE.Vector3(0,1,0))) {
          portal.backCollision.body.collisionResponse = false;
          if(!player.settings.thirdPerson) portal.backCollision.visible = false;
        } else {
          portal.backCollision.body.collisionResponse = false;
          physicsSystem.hitboxes.forEach(function (hitbox) {
              if(hitbox == player.character || hitbox.oldType) return;
              hitbox.body.oldType = hitbox.body.type;
              hitbox.body.type = 2;
          });
          /*if(!portal.backCollision.collisionReponseHooked) {
            portal.backCollision.collisionReponseHooked = true;
            delete portal.backCollision.collisionReponse;
            Object.defineProperty(portal.backCollision.body, "collisionResponse", {
              get: function(a){
                var b = new Error();
                console.log(b.stack);
                console.log(portal.backCollisionHandled);
              }, set: function(a) {
                return a;
              }
            });
          }*/
        }
      }
      portalPhysics.lastCollide = Date.now();
    } else {
      portalPhysics.disableCollisions(portal);
      if(portal.backCollisionHandled) {
        portal.backCollision.body.collisionResponse = true;
        portal.backCollision.visible = true;
        physicsSystem.hitboxes.forEach(function (hitbox) {
            if(!hitbox.body.oldType) return;
            hitbox.body.type = hitbox.body.oldType;
            delete hitbox.body.oldType;
        });
        delete portal.backCollisionHandled;
      }
    }
    if(a.overlaps(c) && (Date.now() - portalPhysics.lastCollide < 50) && (Date.now() - portalPhysics.lastCollide != 0) && portal.counterpart) {
      if((Date.now() - portalPhysics.lastTeleport > 100)) {
        //player went through!
        player.character.body.position.copy(portal.counterpart.position);
        if(Math.floor(portal.rotation.x) == 0) {
          mainGame.camera.rotation.set(mainGame.camera.rotation.x-portal.rotation.x,((portal.counterpart.rotation.y-portal.rotation.y)-(Math.PI-mainGame.camera.rotation.y)),mainGame.camera.rotation.z-portal.rotation.z);
          if(portal.counterpart.rotation.x > Math.PI/2-0.05) {
            player.character.body.position.y += 1;
            player.character.body.velocity.y += 2;
          }
        } else {
          mainGame.camera.rotation.set(mainGame.camera.rotation.x,portal.counterpart.rotation.y,mainGame.camera.rotation.z);
          if(portal.counterpart.rotation.x > Math.PI/2-0.05) player.character.body.velocity.y = -player.character.body.velocity.y;
        }
        portalPhysics.lastTeleport = Date.now();
        //player.cameraControlTaken = true;
        setTimeout(function(){
          //player.cameraControlTaken = false;
        },100);
      } else {
        player.character.body.position.copy(portal.position);
      }
    }
    var position = new THREE.Vector3();
    portal.detector2.getWorldPosition(position);
    if(player.character.position.distanceTo(position) < 2){
      var theCloserThisIsToOneTheBetter = Math.abs(((mainGame.camera.rotation.x-portal.rotation.x)+(mainGame.camera.rotation.y-portal.rotation.y+portal.offset||0)+(mainGame.camera.rotation.z-portal.rotation.z))/3);
      /*if(theCloserThisIsToOneTheBetter > 0.7 && theCloserThisIsToOneTheBetter < 1.3) {
        if(!player.settings.thirdPerson) {
          console.log("buh", theCloserThisIsToOneTheBetter);
          player.cameraControlTaken = true;
          mainGame.camera.rotation.set(mainGame.camera.rotation.x-portal.rotation.x,mainGame.camera.rotation.y+Math.PI-portal.rotation.y,mainGame.camera.rotation.z-portal.rotation.z);
          mainGame.camera.position.copy(portal.counterpart.position);
        }
      } else {
        player.cameraControlTaken = false;
      }*/
    }
  });
}