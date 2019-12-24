//顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'void main() {\n' +
    'gl_Position = u_ModelMatrix*a_Position;\n' +
    '}\n';
//片元着色器
var FSHADER_SOTRCE =
    'void main() {\n' +
    'gl_FragColor = vec4(0.0,1.0,0.0,1.0);\n' +
    '}\n';

//旋转步长
var angle_step = 45.0;

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

    //绘制顶点数目
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the position of the vertices');
    }

    //u_ModelMatrix位置
    var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');

    if (u_ModelMatrix < 0) {
        console.log('Failed to get the storage location of u_ModelMatrix');
    }

    //当前旋转角度
    var currentAngle = 0.0;
    //模型矩阵
    var modelMatrix = new Matrix4();

    //开始绘制动画
    var trik = function () {
        currentAngle = animate(currentAngle);
        draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix);
        requestAnimationFrame(trik);
    };

    trik();

}

//初始化顶点着色器buffer函数
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

//绘制功能
function draw(gl,n,currentAngle,modelMatrix,u_ModelMatrix) {
    //设置旋转矩阵
    modelMatrix.setRotate(currentAngle,0,0,1);
    //将旋转矩阵传输给顶点着色器
    gl.uniformMatrix4fv(u_ModelMatrix, false,modelMatrix.elements);

    //清除canvas
    gl.clear(gl.COLOR_BUFFER_BIT);

    //绘制
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

//记录上一次调用函数的时刻
var g_last = Date.now();
function animate(angle) {
    var now = Date.now();
    var interTime = now - g_last;
    var newAngle = angle + (angle_step*interTime)/1000;
    return newAngle%360;
}