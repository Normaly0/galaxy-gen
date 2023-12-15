attribute float aScale;

uniform float uSize;

varying vec3 vColor;

void main() {

    //Position

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

    //Size

    vec4 mvPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );

    gl_PointSize = uSize * aScale;
    gl_PointSize *= ( 1.0 / - mvPosition.z);

    //Varyings
    vColor = color;

}