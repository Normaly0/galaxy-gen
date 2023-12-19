uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomPos;

varying vec3 vColor;

void main() {

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    //Animation

    float angle = atan(modelPosition.x, modelPosition.z);
    float distanceToCenter = length(modelPosition.xz);
    float angleModifier = (1.0 / distanceToCenter) * uTime * 0.2;
    angle += angleModifier;

    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    //Random Positions

    modelPosition.xyz += aRandomPos;

    //Position
    gl_Position = projectionMatrix * viewMatrix * modelPosition;

    // Size
    vec4 mvPosition = viewMatrix * modelPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= ( 1.0 / - mvPosition.z );

    //Varyings
    vColor = color;

}