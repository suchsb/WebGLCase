var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute float a_PointSize;\n' +
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

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var n = initVertexBuffers(gl);
    if(n < 0) {
        console.log('Failed to set the position and size of the vertices');
    }
    gl.drawArrays(gl.POINTS,0,n);
}

function initVertexBuffers(gl) {
    var verticesSizes = new Float32Array([
        0.0,0.5,10.0,
        -0.5,-0.5,20.0,
        0.5,-0.5,30.0
    ]);

    var n = 3;

    //创建缓冲区
    var vertexSizeBuffers = gl.createBuffer();

    if(!vertexSizeBuffers){
        console.log('Faile to create the buffer object!');
        return -1;
    }

    //绑定缓冲区对象到gl
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexSizeBuffers);
    //缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER,verticesSizes,gl.STATIC_DRAW);

    var FSIZE = verticesSizes.BYTES_PER_ELEMENT;

    var a_Position= gl.getAttribLocation(gl.program,'a_Position');
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    var a_PointSize = gl.getAttribLocation(gl.program,'a_PointSize');
    if(a_PointSize < 0) {
        console.log('Failed to get the storage location of a_PointSize');
    }

    //将缓冲区对象分配给a_Position的变量
    gl.vertexAttribPointer(a_Position,2,gl.FLOAT,false,FSIZE*3,0);
    //连接a_Positon变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_PointSize,1,gl.FLOAT,false,FSIZE*3,FSIZE*2);
    gl.enableVertexAttribArray(a_PointSize);

    return n;
}