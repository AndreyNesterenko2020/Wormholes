const itemTypes = {}

itemTypes.wormholeGun = {
  raycaster: new THREE.Raycaster(),
  lastUse: 0,
  latch: false,
  distance: 10,
  beanOriginal: new THREE.Mesh(new THREE.CylinderGeometry(), portalSystem.portalmaterial2),
  beans: [],
  use: function(event){
    if(event.button != 0) return;
    itemTypes.wormholeGun.raycaster.setFromCamera(new THREE.Vector2(0,0), mainGame.camera);
    var a = physicsSystem.hitboxes.concat();
    a.splice(physicsSystem.hitboxes.indexOf(player.character),1);
    var result = itemTypes.wormholeGun.raycaster.intersectObjects(a);
    if(result[0] && result[0].object.body && result[0].object.body.collisionResponse) {
      var collided = false;
      portalPhysics.processed.forEach(function(e){
        var b = e.detector3.body.aabb.clone();
        b.lowerBound.vadd(e.detector3.body.position,b.lowerBound);
        b.upperBound.vadd(e.detector3.body.position,b.upperBound);
        if(new CANNON.AABB({lowerBound:new CANNON.Vec3(result[0].point.x-1,result[0].point.y-1,result[0].point.z-1),upperBound:new CANNON.Vec3(result[0].point.x+1,result[0].point.y+1,result[0].point.z+1)}).overlaps(b)) {
          collided = true;
        }
      });
      //prevent overlapping portal placement
      if(collided) return;
      setTimeout(function(){
        var portal = portalSystem.spawnPortal(false, false, true);
        portal.position.copy(result[0].point);
        portal.lookAt(portal.localToWorld(new THREE.Vector3()).add(result[0].face.normal.clone().multiplyScalar(-10000)));
        portal.rotation.reorder("YXZ");
        portal.position.add(new THREE.Vector3(0,-0.5,-0.1).applyQuaternion(portal.quaternion));
        portalPhysics.processPortal(portal);
        itemTypes.wormholeGun.lastUse = Date.now();
        itemTypes.wormholeGun.distance = result[0].distance;
        itemTypes.wormholeGun.makeBean(result[0].distance);
        setTimeout(function(){
          //prevent placing portals on physics objects
          if(!portal.backCollision || portal.backCollision.body.type == 1) {
            portalPhysics.disableCollisions(portal);
            portal.removeFromParent();
            portalPhysics.processed.splice(portalPhysics.processed.indexOf(portal),1);
            portalSystem.portals.splice(portalSystem.portals.indexOf(portal),1);
            portal.subcollisions.forEach(function(e){
              physicsSystem.world.remove(e);
            });
            return;
          }
          portal.counterpart = portalSystem.portals[(portalSystem.portals.length-1)%2*portalSystem.portals.length-2];
          portal.counterpart && (portal.counterpart.counterpart = portal);
        }, 40);
      }, 100);
    }
  },
  update: function() {
    itemTypes.wormholeGun.updateBeans();
    itemSystem.viewModel.children[0].rotation.y=0.05;
    if(Date.now()-itemTypes.wormholeGun.lastUse > 300) {
      itemSystem.viewModel.children[0].children[0].children[3].material=portalSystem.portalmaterial;
      itemSystem.viewModel.children[0].position.x = 0;
      itemSystem.viewModel.children[0].rotation.z = 0;
      itemTypes.wormholeGun.latch = false;
      itemSystem.viewModel.children[0].children[0].children[3].scale.setScalar(1);
    } else {
      if(itemSystem.viewModel.children[0].position.x < 0.5 && !itemTypes.wormholeGun.latch) {
        itemSystem.viewModel.children[0].position.x += 0.2;
        itemSystem.viewModel.children[0].rotation.z -= 0.04;
      } else {
        if(itemSystem.viewModel.children[0].rotation.z < 0) {
          itemTypes.wormholeGun.latch = true;
          itemSystem.viewModel.children[0].position.x -= 0.05;
          itemSystem.viewModel.children[0].rotation.z += 0.01;
        }
      }
      itemSystem.viewModel.children[0].children[0].children[3].material=portalSystem.portalmaterial2;
    }
  },
  makeBean: function(distance=10) {
    var bean = itemTypes.wormholeGun.beanOriginal.clone();
    itemTypes.wormholeGun.beans.push(bean);
    bean.rotation.z = Math.PI/2;
    itemSystem.viewModel.children[0].add(bean);
    bean.scale.set(0.01,distance,0.01);
    bean.position.set(-distance/2,-0.6,(5/distance)-2);
    var worldPos = new THREE.Vector3();
    bean.getWorldPosition(worldPos);
    var worldRot = new THREE.Quaternion();
    bean.getWorldQuaternion(worldRot);
    bean.removeFromParent();
    mainGame.scene.add(bean);
    bean.position.copy(worldPos);
    bean.quaternion.copy(worldRot);
    bean.created = Date.now();
    return bean;
  },
  updateBeans: function() {
    itemTypes.wormholeGun.beans.concat().forEach(function(bean) {
      if(Date.now() - bean.created < 100) {
        bean.scale.x += 0.03;
        bean.scale.z += 0.03;
      } else {
        bean.scale.x -= 0.01;
        bean.scale.z -= 0.01;
      }
      if(bean.scale.x <= 0.01) {
        bean.removeFromParent();
        itemTypes.wormholeGun.beans.splice(itemTypes.wormholeGun.beans.indexOf(bean), 1);
      }
    });
  }
}

itemTypes.pickUp = {
  pickedUpItem: false,
  raycaster: new THREE.Raycaster(),
  use: function(event) {
    if(itemTypes.pickUp.pickedUpItem) {
      //drop object
      physicsSystem.makeHitbox(itemTypes.pickUp.pickedUpItem);
      if(event.button == 2) {
        //throw it
        itemTypes.pickUp.pickedUpItem.body.velocity.copy(new THREE.Vector3(0,0,-20).applyQuaternion(mainGame.camera.quaternion));
      }
      itemTypes.pickUp.pickedUpItem = false;
    } else {
      //pick up object
      itemTypes.pickUp.raycaster.setFromCamera(new THREE.Vector2(0,0), mainGame.camera);
      var a = physicsSystem.hitboxes.concat();
      a.splice(physicsSystem.hitboxes.indexOf(player.character),1);
      var result = itemTypes.pickUp.raycaster.intersectObjects(a);
      if(result[0] && result[0].object.body && result[0].object.body.type == 1 && result[0].object.scale.length() <= 2.5 && result[0].distance < 5) {
        //got the object
        itemTypes.pickUp.pickedUpItem = result[0].object;
        physicsSystem.world.remove(result[0].object.body);
        physicsSystem.hitboxes.splice(physicsSystem.hitboxes.indexOf(result[0].object), 1);
        result[0].object.body = false;
      }
    }
  },
  update: function() {
    itemSystem.viewModel.children[0].rotation.y=0;
    if(itemTypes.pickUp.pickedUpItem) {
      itemTypes.pickUp.pickedUpItem.position.copy(itemSystem.viewModel.position.clone().add(new THREE.Vector3(0, 0, -2).applyQuaternion(mainGame.camera.quaternion)));
      itemTypes.pickUp.pickedUpItem.rotation.copy(mainGame.camera.rotation);
      itemSystem.viewModel.children[0].children[0].position.z = -itemTypes.pickUp.pickedUpItem.scale.x/2;
      itemSystem.viewModel.children[0].children[1].position.z = itemTypes.pickUp.pickedUpItem.scale.x/2;
    } else {
      itemSystem.viewModel.children[0].children[0].position.z = -0.6755301356315613;
      itemSystem.viewModel.children[0].children[1].position.z = 0.7029600143432617;
    }
  }
}