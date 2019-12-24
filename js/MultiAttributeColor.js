var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
    'v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    'gl_FragColor = v_Color;\n' +
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(gl);
    if(n < 0) {
        console.log('Failed to set the position and size of the vertices');
    }
    //gl.drawArrays(gl.POINTS,0,n);
    gl.drawArrays(gl.TRIANGLES,0,n);
}

function initVertexBuffers(gl) {
    var verticesSizesColors = new Float32Array([
        0.0,0.5,1.0,0.0,0.0,
        -0.5,-0.5,0.0,1.0,0.0,
        0.5,-0.5,0.0,0.0,1.0
    ]);

    var n = 3;

    //创建缓冲区
    var vertexSizeColorBuffers = gl.createBuffer();

    if(!vertexSizeColorBuffers){
        console.log('Faile to create the buffer object!');
        return -1;
    }

    //绑定缓冲区对象到gl
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexSizeColorBuffers);
    //缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,verticesSizesColors,gl.STATIC_DRAW);

    var FSIZE = verticesSizesColors.BYTES_PER_ELEMENT;

    var a_Position= gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    var a_Color = gl.getAttribLocation(gl.program,'a_Color');
    if(a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
    }

    //将缓冲区对象分配给a_Position的变量
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*5,0);
    //连接a_Positon变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color,3,gl.FLOAT,false,FSIZE*5,FSIZE*2);
    gl.enableVertexAttribArray(a_Color);

    return n;
}