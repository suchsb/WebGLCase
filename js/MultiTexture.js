var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec2 a_TexCoord;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   gl_Position = a_Position;\n' +
    '   v_TexCoord = a_TexCoord;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'precision mediump float;\n' +
    'uniform sampler2D u_Sampler0;\n' +
    'uniform sampler2D u_Sampler1;\n' +
    'varying vec2 v_TexCoord;\n' +
    'void main() {\n' +
    '   vec4 color0 = texture2D(u_Sampler0,v_TexCoord);\n' +
    '   vec4 color1 = texture2D(u_Sampler1,v_TexCoord);\n' +
    '   gl_FragColor = color0*color1;\n' +
    '}\n';

function main() {
    var canvas = document.getElementById("webgl");
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Faild to get the rendering context for WebGL');
    }

    //初始化着色器
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOTRCE)) {
        console.log('Faild to initialize shaders.');
        return;
    }

    var n = initVertexBuffers(gl);
    if (n < 0) {
        console.log('Failed to set the position and size of the vertices');
    }

    if (!initTextures(gl, n)) {
        console.log('Failed to init textures');
    }
}

function initVertexBuffers(gl) {
    var verticesTexCoords = new Float32Array([
        // 顶点坐标，纹理坐标
        -0.5, 0.5, 0.0, 1.0,
        -0.5, -0.5, 0.0, 0.0,
        0.5, 0.5, 1.0, 1.0,
        0.5, -0.5, 1.0, 0.0
    ]);

    var n = 4;

    //创建缓冲区
    var vertexTexCoordBuffers = gl.createBuffer();

    if (!vertexTexCoordBuffers) {
        console.log('Faile to create the buffer object!');
        return -1;
    }

    //绑定缓冲区对象到gl
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexTexCoordBuffers);
    //缓冲区对象写入数据
    gl.bufferData(gl.ARRAY_BUFFER, verticesTexCoords, gl.STATIC_DRAW);

    var FSIZE = verticesTexCoords.BYTES_PER_ELEMENT;
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }
    var a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
    if (a_TexCoord < 0) {
        console.log('Failed to get the storage location of a_Color');
    }

    //将缓冲区对象分配给a_Position的变量
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, FSIZE * 4, 0);
    //连接a_Positon变量与分配给它的缓冲区对象
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, FSIZE * 4, FSIZE * 2);
    gl.enableVertexAttribArray(a_TexCoord);

    return n;
}

function initTextures(gl, n) {
    //创建纹理对象
    var texture0 = gl.createTexture();
    var texture1 = gl.createTexture();
    //获取u_Sampler得存储位置
    var u_Sample0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    var u_Sample1 = gl.getUniformLocation(gl.program, 'u_Sampler1');

    //创建一个image对象
    var image0 = new Image();
    var image1 = new Image();

    image0.onload = function () {
        loadTexture(gl, n, texture0, u_Sample0, image0,0);
    };

    image1.onload = function () {
        loadTexture(gl, n, texture1, u_Sample1, image1,1);
    };

    image0.src = '../resources/imgs/plane.png';
    //image0.src = '../resources/imgs/sun.png';
    image1.src = '../resources/imgs/sun.png';
    return true;
}

var g_texUnit0 = false,
    g_texUnit1 = false;
function loadTexture(gl, n, texture, u_Sample, image,texUnit) {
    //对纹理图像进行y轴反转
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

    if(texUnit == 0) {
        //开启0号纹理单元
        gl.activeTexture(gl.TEXTURE0);
        g_texUnit0 = true;
    } else {
        //开启1号纹理单元
        gl.activeTexture(gl.TEXTURE1);
        g_texUnit1 = true;
    }

    //向target绑定纹理对象
    gl.bindTexture(gl.TEXTURE_2D, texture);

    //配置纹理参数
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //配置纹理图像
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    //将0号纹理传递给着色器
    gl.uniform1i(u_Sample, 0);

    //设置canvas颜色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //清除canvas颜色
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (g_texUnit0 && g_texUnit1) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
}

