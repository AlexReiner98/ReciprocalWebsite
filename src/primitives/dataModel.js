
export let dataModel;
let sceneRef;

export function save(){
  const allPoints = [];
  points.forEach(obj => {
      allPoints.push(obj);
      if(obj.userData?.mirroredPoint) allPoints.push(obj.userData?.mirroredPoint);
  })

  const model = constructReciprocalModel(allPoints, lineConnections);
  const data = model.toJSON();

  const json = JSON.stringify(data, null, 2);

  // 2. Wrap it in a Blob
  const blob = new Blob([json], { type: 'application/json' });

  // 3. Create an object URL
  const url = URL.createObjectURL(blob);

  // 4. Create a hidden anchor and click it
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = data.json;
  document.body.appendChild(a);
  a.click();

  // 5. Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read and parse a JSON file the user has already selected.
 * @param {File} file – A File object (e.g. from an <input type="file"> change event)
 * @returns {Promise<any>} – Resolves with the parsed JSON, or rejects on error.
 */
export function loadJSONFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (err) {
        reject(new Error('Failed to parse JSON: ' + err.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Construct a ReciprocalModel from raw point & line‑connection arrays.
 * @param {THREE.Points[]}      pointsArr    – array of Points (from createSavedPoint)
 * @param {LineConnection[]}    lineConnsArr – array of LineConnection
 * @returns {ReciprocalModel}
 */
export function constructReciprocalModel(pointsArr, lineConnsArr) {
  const model = new ReciprocalModel();
  // copy in the points
  model.points    = [...pointsArr];
  // copy in the connections
  model.lineConns = [...lineConnsArr];
  return model;
}


// 1. Define your container
class ReciprocalModel {
  constructor() {
    this.points = [];            // Array of THREE.Points
    this.lineConns = [];         // Array of LineConnection
  }

  // 2. Gather data for JSON
  toJSON() {
    return {
      points: this.points.map(p => ({
        id:       p.userData.id,
        pos:      p.position.toArray(),
        radius:   p.userData.radius,
        color:    p.userData.color,
        mirrored: p.userData.mirrored,
        locked: p.userData.locked,
        mirroredPoint: p.userData.mirroredPoint?.userData.id,
        source: p.userData.source?.userData.id
      })),
      lineConns: this.lineConns.map(lc => ({
        startId: lc.start.userData.id,
        endId:   lc.end.userData.id
      }))
    };
  }
  
  // 3. Rebuild from JSON
  static fromJSON(data, scene) {
    const model = new ReciprocalModel();
    const pointMap = {};

    // recreate points
    data.points.forEach(pt => {
      const v = new THREE.Vector3(...pt.pos);
      const p = createSavedPoint(v, pt.radius, pt.color, { id: pt.id, ...pt.original });
      scene.add(p);
      model.points.push(p);
      pointMap[pt.id] = p;
    });

    // recreate lines
    data.lineConns.forEach(lc => {
      const start = pointMap[lc.startId];
      const end   = pointMap[lc.endId];
      const geom  = new THREE.BufferGeometry().setFromPoints([start.position, end.position]);
      const line  = new THREE.Line(geom, material);
      const conn  = new LineConnection(start, end, line);
      scene.add(line);
      model.lineConns.push(conn);
    });

    return model;
  }
}