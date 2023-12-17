var output_canvas = document.getElementById('output');
output_canvas.oncontextmenu = function(e) { e.preventDefault(); e.stopPropagation(); }


var gl = output_canvas.getContext("webgl2");

if (gl === null) {
	alert("Unable to initialize WebGL2. Your browser or machine may not support it.");
}

var quad_vao = gl.createVertexArray();
var quad_vbo = gl.createBuffer();
gl.bindVertexArray(quad_vao);
gl.bindBuffer(gl.ARRAY_BUFFER, quad_vbo);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0,-1.0,  1.0,-1.0,  -1.0,1.0,  1.0,1.0]), gl.STATIC_DRAW);
gl.vertexAttribPointer(0, 2, gl.FLOAT, gl.FALSE, 0, 0);
gl.enableVertexAttribArray(0);

var vertex_shader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertex_shader,
	`#version 300 es
	
	in vec2 pos;

	uniform float u_zoom;
	uniform float u_center_x;
	uniform float u_center_y;
	uniform float u_aspect_ratio;

	out vec2 z0;

	void main(){
		gl_Position = vec4(pos,0.0,1.0);
		z0 = (pos+vec2(1.0))*0.5;
		z0.x= u_center_x + (z0.x* u_zoom - u_zoom * 0.5)*u_aspect_ratio;
		z0.y= u_center_y + z0.y* u_zoom - u_zoom * 0.5;
	}`
);
gl.compileShader(vertex_shader);


var frag_shader = gl.createShader(gl.FRAGMENT_SHADER);

var program = gl.createProgram();
gl.attachShader(program, vertex_shader);

var zoom_location;
var center_x_location;
var center_y_location;
var aspect_ratio_location;
var time_location;

function compile_frag_shader(shader_src)
{
	gl.detachShader(program, frag_shader);

	gl.shaderSource(frag_shader, shader_src);
	gl.compileShader(frag_shader);

	var errors   = [];
	var warnings = [];

	var issues = gl.getShaderInfoLog(frag_shader).split("\n");
	for(var i=0; i< issues.length; i++)
	{
		const issue_text = issues[i];
		var error_match   = issue_text.match(/ERROR: 0:([0-9]+)(.*)/);
		if(error_match)
		{
			errors.push({"line":error_match[1], "text":error_match[2]});
		}
		else
		{
			var warning_match = issue_text.match(/WARNING: 0:([0-9]+)(.*)\n/);
			if(warning_match)
			{
				warnings.push({"line":warning_match[1], "text":warning_match[2]});
			}
		}
	}

	gl.attachShader(program, frag_shader);
	gl.linkProgram(program);

	zoom_location = gl.getUniformLocation(program, "u_zoom");
	center_x_location = gl.getUniformLocation(program, "u_center_x");
	center_y_location = gl.getUniformLocation(program, "u_center_y");
	aspect_ratio_location = gl.getUniformLocation(program, "u_aspect_ratio");

	time_location = gl.getUniformLocation(program, "u_time");

	return {"success" : errors=="", "errors" : errors, "warnings" : warnings};
}

var zoom = 2.5;
var center_x = -0.5;
var center_y = 0.0;
var aspect_ratio = output_canvas.width/output_canvas.height;

const time0 = new Date().getTime();

function render()
{
	gl.useProgram(program);

	gl.uniform1f(zoom_location, zoom);
	gl.uniform1f(center_x_location, center_x);
	gl.uniform1f(center_y_location, center_y);
	gl.uniform1f(aspect_ratio_location, aspect_ratio);

	const time = new Date().getTime() - time0;
	gl.uniform1f(time_location, time);

	gl.bindVertexArray(quad_vao);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

render();

const period = 16;

setInterval(() => {
	render();
}, period);

function resize()
{
	var width = gl.canvas.clientWidth;
	var height = gl.canvas.clientHeight;
	if (gl.canvas.width != width ||
			gl.canvas.height != height)
	{
			gl.canvas.width = width;
			gl.canvas.height = height;
			gl.viewport(0,0,width,height);
			aspect_ratio = width/height;
	}
	render();
}
new ResizeObserver(resize).observe(output_canvas)

var mouse_down = 0;
var last_mouse_x, last_mouse_y;
var last_center_x, last_center_y;
output_canvas.onmousedown = function (e)
{
	if(mouse_down == 0)
	{
		last_center_x = center_x;
		last_center_y = center_y;
	}
	mouse_down++;
}
output_canvas.onmouseup = function ()
{
	mouse_down--;
}
output_canvas.onmouseleave = function()
{
	if(mouse_down > 0)
	{
		output_canvas.onmouseup();
	}
}
output_canvas.onmouseenter = function(e)
{
	if(e.buttons)
	{
		output_canvas.onmousedown(e);
	}
}

output_canvas.onmousemove = function (e)
{
	const pos = e.currentTarget.getBoundingClientRect();
	var x = e.clientX - pos.left;
	var y = e.clientY - pos.top;
	if(mouse_down == 0)
	{
		last_mouse_x = x;
		last_mouse_y = y;
	}
	else
	{
		center_x = last_center_x + (last_mouse_x-x)/e.currentTarget.width * zoom * aspect_ratio;
		center_y = last_center_y + (y-last_mouse_y)/e.currentTarget.height * zoom;
		render();
	}
}
output_canvas.onwheel = function (e)
{
	zoom *= 1 + 0.002 * e.deltaY;
	render();
}

var fingers = 0;
var last_fingers_distance;
var last_touches;
output_canvas.ontouchstart = function (e)
{
	last_center_x = center_x;
	last_center_y = center_y;
	last_touches = e.touches;

	fingers++;

	if(fingers == 2)
	{
		var x = e.touches[0].pageX - e.touches[1].pageX;
		var y = e.touches[0].pageY - e.touches[1].pageY;
		last_fingers_distance = Math.sqrt(x*x + y*y);
	}
}

output_canvas.ontouchend = function(e)
{
	last_touches = e.touches;
	fingers--;
}

output_canvas.ontouchmove = function (e)
{
	switch(fingers)
	{
		case 1:
			const pos = e.currentTarget.getBoundingClientRect();
			var x = e.touches[0].pageX - pos.left;
			var y = e.touches[0].pageY - pos.top;
			
			center_x = last_center_x + (last_touches[0].pageX-x)/e.currentTarget.width * zoom * aspect_ratio;
			center_y = last_center_y + (y-last_touches[0].pageY)/e.currentTarget.height * zoom;

			render();
			break;
		case 2:
			var x = e.touches[0].pageX - e.touches[1].pageX;
			var y = e.touches[0].pageY - e.touches[1].pageY;
			var fingers_distance = Math.sqrt(x*x + y*y);
			zoom *= last_fingers_distance / fingers_distance;
			last_fingers_distance = fingers_distance;

			last_touches = e.touches;

			render();
			break;
		default: break;
	}

}