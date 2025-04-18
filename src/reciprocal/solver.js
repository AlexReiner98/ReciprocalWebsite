import { points } from "../primitives/3dCanvas";
import { lineConnections } from "../primitives/lineConnections";

const allPoints = [];

export function runSovler()
{
    allPoints.length = 0;
    points.forEach(point => {
        allPoints.push(point);
        if(point.userData?.mirroredPoint)allPoints.push(point.userData.mirroredPoint);
    })

    console.log(allPoints);
    console.log(lineConnections);
}