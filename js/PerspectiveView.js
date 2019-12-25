var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'varying vec4 v_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'void main() {\n' +
    '   gl_Position = u_ProjMatrix*u_ViewMatrix*u_ModelMatrix*a_Position;\n' +
    '   v_Color = a_Color;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'precision mediump float;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '   gl_FragColor = v_Color;\n' +
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
    if (n < 0) {
        console.log('Failed to set the position and size of the vertices');
    }

    var u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
    if (u_ViewMatrix < 0) {
        console.log("无法获取矩阵变量的存储位置");
        return;
    }

    var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    if (u_ModelMatrix < 0) {
        console.log("无法获取矩阵变量的存储位置");
        return;
    }

    var u_ProjMatrix = gl.getUniformLocation(gl.program, "u_ProjMatrix");
    if (u_ProjMatrix < 0) {
        console.log("无法获取矩阵变量的存储位置");
        return;
    }

    var viewMatrix = new Matrix4();//视图矩阵
    var modelMatrix = new Matrix4();//模型矩阵
    var projMatrix = new Matrix4();//投影矩阵

    //绘制右边
    modelMatrix.setTranslate(0.75,0,0);
    viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
    projMatrix.setPerspective(30,canvas.width/canvas.height,1,100);

    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    modelMatrix.setTranslate(-0.75,0,0);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, 0, n);

}

function initVertexBuffers(gl) {
    var verticesSizesColors = new Float32Array([
        //x,y,z,r,g,b
        //绿色三角形
        0.0, 1.0, -4.0, 0.4, 1.0, 0.4,
        -0.5, -1.0, -4.0, 0.4, 1.0, 0.0,
        0.5, -1.0, -4.0, 1.0, 0.4, 0.4,

        //黄色三角形
        0.0, 1.0, -2.0, 1.0, 0.4, 0.4,
        -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
        0.5, -1.0, -2.0, 1.0, 1.0, 0.4,

        //蓝色三角形
        0.0, 1.0, 0.0, 0.4, 0.4, 1.0,
        -0.5, -1.0, 0.0, 0.4, 0.4, 1.0,
        0.5, -1.0, 0.0, 1.0, 0.4, 0.4,
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