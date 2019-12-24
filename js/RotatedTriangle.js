//顶点着色器
var VSHADER_SOURCE =
    //x' = xcosb - ysinb
    //y' = xsinb + ycosb
    //z' = z;
    'attribute vec4 a_Position;\n' +
    'uniform float u_CosB,u_SinB;\n' +
    'void main() {\n' +
    'gl_Position.x = a_Position.x*u_CosB - a_Position.y*u_SinB;\n' +
    'gl_Position.y = a_Position.x*u_SinB + a_Position.y*u_CosB;\n' +
    'gl_Position.z = a_Position.z;\n' +
    'gl_Position.w = a_Position.w;\n' +
    '}\n';
//片元着色器
var FSHADER_SOTRCE =
    'void main() {\n' +
    'gl_FragColor = vec4(0.0,1.0,0.0,1.0);\n' +
    '}\n';

var angle = 90;

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
    if (n < 0) {
        console.log('Failed to set the position of the vertices');
    }

    var radian = Math.PI*angle/180.0;
    var cosB = Math.cos(radian);
    var sinB = Math.sin(radian);

    var u_CosB = gl.getUniformLocation(gl.program,'u_CosB');
    var u_SinB = gl.getUniformLocation(gl.program,'u_SinB');

    if (u_CosB < 0|| u_SinB < 0) {
        console.log('Failed to get the storage location of B');
    }
    gl.uniform1f(u_CosB, cosB);
    gl.uniform1f(u_SinB, sinB);

    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    var vertices = new Float32Array([
        -0.5, -0.5, 0.5, -0.5, 0.0, 0.5
    ]);

    var n = 3;

    //创建缓冲区
    var vertexBuffers = gl.createBuffer();
    if (!vertexBuffers) {
        console.log('Faile to create the buffer object!');
        return -1;
    }

    //绑定缓冲区对象到gl
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers);

    //缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    //将缓冲区对象分配给a_Position的变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    //连接a_Positon变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    return n;
}