var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;' +
    'void main() {\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = a_PointSize;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'void main() {\n' +
    'gl_FragColor = vec4(0.0,1.0,0.0,1.0);\n' +
    '}\n';

function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Faild to get the rendering context for WebGL');
    }

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOTRCE)) {
        console.log('Faild to initialize shaders.');
        return;
    }

    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');

    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    if(a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
    }

    gl.vertexAttrib3f(a_Position,0.0,0.0,0.0);
    gl.vertexAttrib1f(a_PointSize,20.0);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, 1);
}