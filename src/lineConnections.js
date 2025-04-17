import * as THREE from "three";

let sceneRef;
export const lineConnections = [];

const lineColour = 0xffffff;

let tempVec1 = new THREE.Vector3(), tempVec2 = new THREE.Vector3();

export class LineConnection {
    constructor(start, end, lineMesh) {
      this.start = start;   // THREE.Object3D
      this.end = end;       // THREE.Object3D
      this.lineMesh = lineMesh; // THREE.Line object
      this.lineMesh.userData.lineConnection = this;
    }
  
    update() {
      if(!this.start || !this.end) 
      {
        removeLineConnection(this);
      }

      const positions = this.lineMesh.geometry.attributes.position.array;
      this.start.getWorldPosition(tempVec1);
      this.end.getWorldPosition(tempVec2);
  
      positions[0] = tempVec1.x;
      positions[1] = tempVec1.y;
      positions[2] = tempVec1.z;
      positions[3] = tempVec2.x;
      positions[4] = tempVec2.y;
      positions[5] = tempVec2.z;
  
      this.lineMesh.geometry.attributes.position.needsUpdate = true;
    }
  }

export function addLineConnection (scene, selected) {
    if(!sceneRef) sceneRef = scene;

    console.log("lineConnection count: " + lineConnections.length);
    const [p1, p2] = Array.from(selected);

    if(checkLineExists([p1,p2]))return;

    const geometry = new THREE.BufferGeometry();
    const linePoints = new Float32Array(6); // 2 points x 3 coords
    geometry.setAttribute('position', new THREE.BufferAttribute(linePoints, 3));

    const material = new THREE.LineBasicMaterial({ color: lineColour });
    const line = new THREE.Line(geometry, material);
    scene.add(line);

    const conn = new LineConnection(p1, p2, line);
    p1.userData.lineConnections.push(conn);
    p2.userData.lineConnections.push(conn);
    
    conn.update();
    lineConnections.push(conn);
}

export function removeLineConnection(lineConnection)
{
  const index = lineConnections.indexOf(lineConnection);
  if (index > -1) { // only splice array when item is found
    lineConnections.splice(index, 1); // 2nd parameter means remove one item only
  }
  sceneRef.remove(lineConnection.lineMesh);
}

export function removeLineConnections(lineConnections)
{
  lineConnections.forEach(line => removeLineConnection(line));
}

export function tryRebuildLineConnections(obj) {

  if (obj.userData?.type !== 'point' || !obj.userData?.lineConnections || obj.userData?.lineConnections.length === 0) return;
  obj.userData.lineConnections.forEach(lineConnection => {
    if(lineConnections.some(lc => lc === lineConnection)) return;

    //if otherpoint isn't in the scene, return
    let otherPoint;
    (lineConnection.start === obj)?otherPoint = lineConnection.end :otherPoint = lineConnection.start;

    let hit = false;
    sceneRef.traverse(obj => {
      if(obj === otherPoint){
        hit = true;
        return;
      }
    })
    if(!hit) return;

    //reinstate the connection
    sceneRef.add(lineConnection.lineMesh);
    lineConnections.push(lineConnection);
  });
}

function checkLineExists([p1, p2])
{
  let exists = false;
  lineConnections.forEach(line => {
    if((line.start === p1 && line.end === p2) || (line.end === p1 && line.start === p2 )){
      exists = true;
      console.log("line already exists");
      return;
    }
  })
  return exists;
}