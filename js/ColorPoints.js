var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
    '}\n';
var FSHADER_SOTRCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    'gl_FragColor = u_FragColor;\n' +
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
    var u_FragColor = gl.getUniformLocation(gl.program,'u_FragColor');

    //获取a_position存储地址
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }
    //获取u_FragColor存储地址
    if(u_FragColor < 0) {
        console.log('Failed to get the storage location of u_FragColor');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function(ev){
        click(ev,gl,canvas,a_Position,u_FragColor);
    };

    var g_point = [];
    var g_color = [];
    function click(ev, gl, canvas, a_Position,u_FragColor) {
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
        y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

        g_point.push([x,y]);

        if (x >= 0.0 && y>=0.0) {
            g_color.push([1.0,0.0,0.0,1.0]);
        } else if (x < 0.0 && y < 0.0) {
            g_color.push([0.0,1.0,0.0,1.0]);
        } else {
            g_color.push([1.0,1.0,1.0,1.0]);
        }

        gl.clear(gl.COLOR_BUFFER_BIT);

        for(var i = 0; i < g_point.length; i++) {
            var rgba = g_color[i];

            gl.vertexAttrib3f(a_Position,g_point[i][0],g_point[i][1],0.0);
            gl.uniform4f(u_FragColor,rgba[0],rgba[1],rgba[2],rgba[3]);
            gl.drawArrays(gl.POINTS, 0, 1);
        }

    }
}