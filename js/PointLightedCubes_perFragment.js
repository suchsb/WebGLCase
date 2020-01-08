// 顶点着色器
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +    //顶点位置
    'attribute vec4 a_Color;\n' +       //顶点颜色
    'attribute vec4 a_Normal;\n' +      //法向量
    'uniform mat4 u_MvpMatrix;\n' +     //模型视图投影矩阵
    'uniform mat4 u_ModelMatrix;\n' +    // 模型矩阵
    'uniform mat4 u_NormalMatrix;\n' +   // 逆转置矩阵
    'varying vec4 v_Color;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' + //处理通过模型视图投影矩阵转换后的位置
    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' + // 计算出顶点的世界坐标，通过模型矩阵
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' + //计算出当前顶点的法向量并且归一化
    '  v_Color = a_Color;\n' + //传值颜色
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +      //设置float类型的值的精度
    '#endif\n' +
    'uniform vec3 u_LightColor;\n' +     // 点光源的颜色
    'uniform vec3 u_LightPosition;\n' +  // 点光源的位置
    'uniform vec3 u_AmbientLight;\n' +   // 环境光的颜色
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    // 对法线进行归一化，因为其内插之后长度不一定是1.0
    '  vec3 normal = normalize(v_Normal);\n' +
    // 计算光线方向并归一化
    '  vec3 lightDirection = normalize(u_LightPosition - v_Position);\n' +
    // 计算光线方向和法向量的点积
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // 计算diffuse、ambient以及最终的颜色
    '  vec3 diffuse = u_LightColor * v_Color.rgb * nDotL;\n' +
    '  vec3 ambient = u_AmbientLight * v_Color.rgb;\n' +
    '  gl_FragColor = vec4(diffuse + ambient, v_Color.a);\n' +
    '}\n';


//主函数，页面加载完成触发
function main() {
    //获取canvas对象
    var canvas = document.getElementById("webgl");

    //获取WebGL上下文
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console("您的浏览器不支持WebGL");
        return;
    }

    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log("初始化着色器失败");
        return;
    }

    //设置顶点的坐标、颜色和法向量
    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log("无法获取到顶点个数，设置顶点坐标、颜色和法向量失败");
        return;
    }

    //初始化背景色和前后关系功能开启
    gl.clearColor(0, 0, 0, 1);
    gl.enable(gl.DEPTH_TEST);

    //获取模型视图投影矩阵、光线颜色变量和归一化世界坐标uniform变量的存储位置
    var u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");
    var u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
    var u_NormalMatrix = gl.getUniformLocation(gl.program, "u_NormalMatrix");


    var u_LightColor = gl.getUniformLocation(gl.program, "u_LightColor");
    var u_LightPosition = gl.getUniformLocation(gl.program, "u_LightPosition");
    var u_AmbientLight = gl.getUniformLocation(gl.program, "u_AmbientLight");

    if (!u_ModelMatrix || !u_LightColor || !u_LightPosition || !u_AmbientLight || !u_NormalMatrix || !u_MvpMatrix) {
        console.log("无法获取相关的存储位置，或者未定义");
        return;
    }

    //设置光线颜色（白色）
    gl.uniform3f(u_LightColor, 1.0, 1.0, 1.0);
    //设置光线方向（不是世界坐标系下的，所以讲这些取消掉，直接把位置传入）
    gl.uniform3f(u_LightPosition, 2.0, 3.0, 4.0);
    //设置环境光颜色
    gl.uniform3f(u_AmbientLight, 0.2, 0.2, 0.2);

    //声明矩阵
    var mvpMatrix = new Matrix4(); //声明一个模型视图投影矩阵
    var modelMatrix = new Matrix4(); //模型矩阵
    var normalMatrix = new Matrix4(); //用来变换法向量的矩阵

    //计算矩阵
    mvpMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);//设置透视矩阵
    mvpMatrix.lookAt(6, 6, 14, 0, 0, 0, 0, 1, 0); //设置视点的位置

    modelMatrix.setRotate(0, 0, 1, 0);

    mvpMatrix.multiply(modelMatrix);


    //将移动后的模型传给u_MvpMatrix变量
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);

    //将模型视图投影矩阵传给u_MvpMatrix变量
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    //根据模型矩阵计算用来变换法向量的矩阵
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    //将用来变换放下了的矩阵传给u_NormalMatrix变量
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);

    //清除底色和深度缓冲区
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_BYTE, 0); //绘制图形
}

function initVertexBuffers(gl) {
    // 绘制一个立方体
    //    v6----- v5
    //   /|      /|
    //  v1------v0|
    //  | |     | |
    //  | |v7---|-|v4
    //  |/      |/
    //  v2------v3
    var vertices = new Float32Array([   // 顶点坐标
        2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, 2.0, // v0-v1-v2-v3 front
        2.0, 2.0, 2.0, 2.0, -2.0, 2.0, 2.0, -2.0, -2.0, 2.0, 2.0, -2.0, // v0-v3-v4-v5 right
        2.0, 2.0, 2.0, 2.0, 2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, 2.0, // v0-v5-v6-v1 up
        -2.0, 2.0, 2.0, -2.0, 2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, // v1-v6-v7-v2 left
        -2.0, -2.0, -2.0, 2.0, -2.0, -2.0, 2.0, -2.0, 2.0, -2.0, -2.0, 2.0, // v7-v4-v3-v2 down
        2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, 2.0, -2.0, 2.0, 2.0, -2.0  // v4-v7-v6-v5 back
    ]);


    var colors = new Float32Array([    // 顶点颜色
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v1-v2-v3 front
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v3-v4-v5 right
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v0-v5-v6-v1 up
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v1-v6-v7-v2 left
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,     // v7-v4-v3-v2 down
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0　    // v4-v7-v6-v5 back
    ]);

    var normals = new Float32Array([    // 法向量
        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,  // v0-v1-v2-v3 front
        1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,  // v0-v3-v4-v5 right
        0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,  // v0-v5-v6-v1 up
        -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0,  // v1-v6-v7-v2 left
        0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,  // v7-v4-v3-v2 down
        0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0   // v4-v7-v6-v5 back
    ]);


    // 绘制点的顺序下标
    var indices = new Uint8Array([
        0, 1, 2, 0, 2, 3,    // front
        4, 5, 6, 4, 6, 7,    // right
        8, 9, 10, 8, 10, 11,    // up
        12, 13, 14, 12, 14, 15,    // left
        16, 17, 18, 16, 18, 19,    // down
        20, 21, 22, 20, 22, 23     // back
    ]);


    // 通过initArrayBuffer方法将顶点数据保存到缓冲区
    if (!initArrayBuffer(gl, 'a_Position', vertices, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Color', colors, 3, gl.FLOAT)) return -1;
    if (!initArrayBuffer(gl, 'a_Normal', normals, 3, gl.FLOAT)) return -1;

    // 创建顶点索引缓冲区对象
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('无法创建顶点索引的缓冲区对象');
        return -1;
    }

    //将顶点索引数据存入缓冲区
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, attribute, data, num, type) {
    //创建缓冲区对象
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log("无法创建缓冲区对象");
        return false;
    }
    //绑定缓冲区，并将数据存入缓冲区
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    //获取相关变量存储位置，赋值并开启缓冲区
    var a_attribute = gl.getAttribLocation(gl.program, attribute);
    if (a_attribute < 0) {
        console.log("无法获取" + attribute + "变量的相关位置");
        return false;
    }

    //向缓冲区赋值
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);

    //开启数据，并解绑缓冲区
    gl.enableVertexAttribArray(a_attribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}