const physicsSystem = {};
physicsSystem.world = new CANNON.World();
physicsSystem.world.gravity.y = -9.807;
//physicsSystem.world.defaultContactMaterial.friction = 0;
physicsSystem.hitboxes = [];
physicsSystem.lastTick = 0;

physicsSystem.getWorldScale = function(obj) {
  var multiplierX = 1;
  var multiplierY = 1;
  var multiplierZ = 1;
  function guh(obj) {
    if(obj.parent) {
      multiplierX *= obj.parent.scale.x;
      multiplierY *= obj.parent.scale.y;
      multiplierZ *= obj.parent.scale.z;
      guh(obj.parent);
    }
  }
  guh(obj);
  return new THREE.Vector3(obj.scale.x*multiplierX,obj.scale.y*multiplierY,obj.scale.z*multiplierZ);
}

physicsSystem.makeHitbox = function(obj, solid) {
  if(obj.body) {
    console.error("This object already has a hitbox!");
    return obj.body;
  }
  obj.body = new CANNON.Body({mass:solid == true ? 0 : 1});
  var scale = physicsSystem.getWorldScale(obj);
  var position = new THREE.Vector3();
  obj.getWorldPosition(position);
  var quaternion = new THREE.Quaternion();
  obj.getWorldQuaternion(quaternion);
  obj.body.addShape(new CANNON.Box(new CANNON.Vec3(scale.x/2,scale.y/2,scale.z/2)));
  obj.body.position.set(position.x,position.y,position.z);
  obj.body.quaternion.set(quaternion.x,quaternion.y,quaternion.z,quaternion.w);
  obj.body.material = physicsSystem.world.defaultMaterial;
  physicsSystem.hitboxes.push(obj);
  physicsSystem.world.add(obj.body);
  return obj.body;
}

physicsSystem.update = function () {
  var delta = (Date.now()-physicsSystem.lastTick)/1000;
  if(delta > 0.7) {
    console.error("physicsSystem.update: Delta overflow!");
    physicsSystem.lastTick = Date.now();
    delta = 0.01;
  }
  if(delta>0.01) {
    physicsSystem.world.step(delta);
    physicsSystem.lastTick = Date.now();
  }
  physicsSystem.hitboxes.forEach(function(obj) {
    obj.position.copy(obj.parent.worldToLocal(new THREE.Vector3().copy(obj.body.position)));
    obj.quaternion.copy(obj.body.quaternion);
  });
}