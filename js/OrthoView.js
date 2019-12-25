var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix*a_Position;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
    '}\n';

var g_near = 0.0,g_far = 0.5;

function main() {
    var canvas = document.getElementById("webgl");
    var nf = document.getElementById("nearFar");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Faild to get the rendering context for WebGL');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOTRCE)) {
        console.log('Faild to initialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the position and size of the vertices');
    }

    //设置视角矩阵的相关信息
    var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    if (u_ProjMatrix < 0) {
        console.log("无法获取矩阵变量的存储位置");
        return;
    }
    //设置视角矩阵的相关信息（视点，视线，上方向）
    var projMatrix = new Matrix4();
    draw(gl, n, u_ProjMatrix, projMatrix,nf);

    document.onkeydown = function (ev) {
        keydown(ev, gl, n, u_ProjMatrix, projMatrix,nf);
    }
}

function initVertexBuffers(gl) {
    var verticesSizesColors = new Float32Array([
        //x,y,z,r,g,b
        //绿色三角形
        0.0, 0.5, -0.4, 0.4, 1.0, 0.4,
        -0.5, -0.5, -0.4, 0.4, 1.0, 0.0,
        0.5, -0.5, -0.4, 1.0, 0.4, 0.4,

        //黄色三角形
        0.5, 0.4, -0.2, 1.0, 0.4, 0.4,
        -0.5, 0.4, -0.2, 1.0, 1.0, 0.4,
        0.0, -0.6, -0.2, 1.0, 1.0, 0.4,

        //蓝色三角形
        0.0, 0.5, 0.0, 0.4, 0.4, 1.0,
        -0.5, -0.5, 0.0, 0.4, 0.4, 1.0,
        0.5, -0.5, 0.0, 1.0, 0.4, 0.4,
    ]);

    var n = 9;

    //创建缓冲区
    var vertexSizeColorBuffers = gl.createBuffer();

    if (!vertexSizeColorBuffers) {
        console.log('Faile to create the buffer object!');
        return -1;
    }

    //绑定缓冲区对象到gl
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexSizeColorBuffers);
    //缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesSizesColors, gl.STATIC_DRAW);

    var FSIZE = verticesSizesColors.BYTES_PER_ELEMENT;

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
    }

    //将缓冲区对象分配给a_Position的变量
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    //连接a_Positon变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.enableVertexAttribArray(a_Color);

    return n;
}

function keydown(ev, gl, n, u_ProjMatrix, projMatrix,nf) {
    switch(ev.keyCode) {
        case 39: g_near += 0.01;break;
        case 37: g_near -= 0.01;break;
        case 38: g_far += 0.01;break;
        case 40: g_far -= 0.01;break;
        default: return;
    }
    draw(gl, n, u_ProjMatrix, projMatrix,nf);
}

function draw(gl, n, u_ProjMatrix, projMatrix,nf) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    projMatrix.setOrtho(-1,1,-1,1,g_near,g_far);
    //将试图矩阵传给u_ViewMatrix变量
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    console.log(g_near + ',' + g_far);
    nf.innerHTML = 'near:' + Math.round(g_near*100)/100 + ',far:' + Math.round(g_far*100)/100;

    gl.drawArrays(gl.TRIANGLES, 0, n);
}

