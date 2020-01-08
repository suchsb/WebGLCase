//顶点着色器
var VSHADER_SOURCE = "" +
    "attribute vec4 a_Position;\n" +
    "attribute vec4 a_Color;\n" +
    "attribute vec4 a_Normal;\n" + //法向量
    "uniform mat4 u_ModelViewMatrix;\n" + //模型矩阵
    "uniform mat4 u_NormalMatrix;\n" + //模型矩阵
    "uniform vec3 u_LightColor;\n" + //光线颜色
    "uniform vec3 u_LightDirection;\n" + //归一化的光线坐标
    "uniform vec3 u_AmbientLight;\n" + //环境光颜色
    "varying vec4 v_Color;\n" +
    "void main(){\n" +
    "   gl_Position = u_ModelViewMatrix * a_Position;\n" +
    "   vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n" +
    "   float nDotL = max(dot(u_LightDirection, normal), 0.0);\n" +
    "   vec3 diffuse = u_LightColor*vec3(a_Color)*nDotL;\n" +
    "   vec3 ambient = u_AmbientLight*a_Color.rgb;\n" +
    "   v_Color = vec4(diffuse + ambient,a_Color.a);\n" +
    "}\n";

//片元着色器
var FSHADER_SOURCE = "" +
    "#ifdef GL_ES\n" +
    "precision mediump float;\n" +
    "#endif\n" +
    "varying vec4 v_Color;\n" +
    "void main(){" +
    "   gl_FragColor = v_Color;\n" +
    "}\n";

function main() {
    //声明js需要的相关变量
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);

    if (!gl) {
        console.log("你的浏览器不支持WebGL");
        return;
    }

    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("无法初始化着色器");
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log("无法创建缓冲区");
        return;
    }

    //设置视角矩阵的相关信息
    var u_ModelViewMatrix = gl.getUniformLocation(gl.program, "u_ModelViewMatrix");
    if (u_ModelViewMatrix < 0) {
        console.log("无法获取矩阵变量的存储位置");
        return;
    }

    //设置法向量变换矩阵的相关信息
    var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");
    if (u_NormalMatrix < 0) {
        console.log("无法获取法向量变换矩阵的存储位置");
        return;
    }

    //设置光线颜色矩阵的相关信息
    var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    if (u_LightColor < 0) {
        console.log("无法获取光纤颜色的存储位置");
        return;
    }

    //设置视角矩阵的相关信息
    var u_LightDirection = gl.getUniformLocation(gl.program, "u_LightDirection");
    if (u_LightDirection < 0) {
        console.log("无法获取光纤方向的存储位置");
        return;
    }

    //设置视角矩阵的相关信息
    var u_AmbientLight = gl.getUniformLocation(gl.program, "u_AmbientLight");
    if (u_AmbientLight < 0) {
        console.log("无法获取环境光的存储位置");
        return;
    }

    //设置光线颜色
    gl.uniform3f(u_LightColor,1.0,1.0,1.0);
    //设置光线方向
    var lidhtDirection = new Vector3([0.5,3.0,4.0]);
    lidhtDirection.normalize();
    gl.uniform3fv(u_LightDirection, lidhtDirection.elements);
    gl.uniform3f(u_AmbientLight,0.2,0.2,0.2);

    //设置底色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    //进入场景初始化
    //设置视角矩阵的相关信息（视点，视线，上方向）
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(-7, 2.5, 6, 0, 0, 0, 0, 1, 0);

    //设置模型矩阵的相关信息
    var modelMatrix = new Matrix4();
    modelMatrix.setTranslate(0,1,0);
    modelMatrix.setRotate(90, 0, 0, 1);

    //设置透视投影矩阵
    var projMatrix = new Matrix4();
    projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);

    //计算出模型视图矩阵 viewMatrix.multiply(modelMatrix)相当于在着色器里面u_ViewMatrix * u_ModelMatrix
    var modeViewMatrix = projMatrix.multiply(viewMatrix.multiply(modelMatrix));

    //将试图矩阵传给u_ViewMatrix变量
    gl.uniformMatrix4fv(u_ModelViewMatrix, false, modeViewMatrix.elements);

    //设置法向量变换矩阵
    var normalMatrix = new Matrix4();
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    //开启隐藏面清除
    gl.enable(gl.DEPTH_TEST);

    //清空颜色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //绘制图形
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0);
}

function initVertexBuffers(gl) {
    // 创建一个立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // 顶点的位置坐标数据
        1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0,  // v0-v3-v4-v5 right
        1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0,  // v0-v5-v6-v1 up
        -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0,  // v1-v6-v7-v2 left
        -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,  // v7-v4-v3-v2 down
        1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0   // v4-v7-v6-v5 back
    ]);

    var colors = new Float32Array([     // 顶点的颜色
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, // v0-v3-v4-v5 right(white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v1-v6-v7-v2 left(white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0,  // v0-v1-v2-v3 front(white)
        1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0   // v4-v7-v6-v5 back(white)
    ]);

    var normals = new Float32Array([
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);

    //顶点索引
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);

    if(!initArrayBufferer(gl,vertices,3,gl.FLOAT,'a_Position')){
        return -1;
    }

    if(!initArrayBufferer(gl,colors,3,gl.FLOAT,'a_Color')){
        return -1;
    }

    if(!initArrayBufferer(gl,normals,3,gl.FLOAT,'a_Normal')){
        return -1;
    }

    var indexBuffer = gl.createBuffer();

    //将顶点索引数据写入缓冲区对象
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBufferer(gl, data, num, type, attribute) {
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log("无法创建缓冲区对象");
        return false;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);
    //将缓冲区对象分配给attribute变量
    var a_attribute = gl.getAttribLocation(gl.program,attribute);
    if (a_attribute < 0) {
        console.log("无法获取存储变量位置");
        return false;
    }
    gl.vertexAttribPointer(a_attribute, num, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_attribute);

    return true;
}