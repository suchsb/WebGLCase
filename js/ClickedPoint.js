var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'void main() {\n' +
    'gl_Position = a_Position;\n' +
    'gl_PointSize = 10.0;\n' +
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
    var a_Position = gl.getAttribLocation(gl.program,'a_Position');
    //获取a_position存储地址
    if(a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    canvas.onmousedown = function(ev){
        click(ev,gl,canvas,a_Position);
    }

    var g_point = [];
    function click(ev, gl, canvas, a_Position) {
        var x = ev.clientX;
        var y = ev.clientY;
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.height/2)/(canvas.height/2);
        y = (canvas.width/2 - (y - rect.top))/(canvas.width/2);

        g_point.push(x);
        g_point.push(y);

        gl.clear(gl.COLOR_BUFFER_BIT);

        for(var i = 0; i < g_point.length; i+=2) {
            gl.vertexAttrib3f(a_Position,g_point[i],g_point[i + 1],0.0);
            gl.drawArrays(gl.POINTS, 0, 1);
        }

    }
}