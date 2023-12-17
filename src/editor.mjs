import {EditorView, basicSetup} from "codemirror"
import { EditorState } from "@codemirror/state";
import {keymap} from "@codemirror/view"
import {lintGutter} from "@codemirror/lint"

import {UpdateLints} from "./errors.mjs"

import {javascript} from "@codemirror/lang-javascript"

import {GLSL} from "../glsl_parser/dist/index"

var initial_program =
`vec2 rotated(float theta, vec2 z)
{
	return z * mat2(cos(theta), -sin(theta), sin(theta), cos(theta));
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d )
{
	return a + b*cos( 6.28318*(c*t+d) );
}

vec3 rainbow(float t)
{
	return palette(t,
				    vec3(0.5, 0.5, 0.5),
				    vec3(0.5, 0.5, 0.5),
				    vec3(1.0, 1.0, 1.0),
				    vec3(0.00, 0.33, 0.67));
}

#define PI_2 6.28318530718

const uint max_iterations = 10u;

void main()
{
	vec2 zn = z0;
	float s = 0.0;

	float aa = (sin(u_time/2000.0) + 1.0)/2.0;

	uint best_i = -1u;

	float best = 0.0;

	uint i;
	for(i=0u ; i < max_iterations; i++)
	{
		zn = rotated(float(i+1u)*fract(u_time/500000.0)* PI_2, zn);
		vec2 z12 = mul(zn, mul(zn, zn));

		vec2 z34 = mul(vec2(2.0,0.0),z12) - z0;

		z34 = mul(z34,z34);

		z12 = mul(vec2(-6.0,0.0), z12+z0);

		z12 = mul(zn, z12);

		zn = div(z12,z34);
		
		float v = log(mag(zn));
		
		if(v > best)
		{
			best = v;
			best_i = i;
		}
		s = s + v;
	}
	s= abs(s)/20.0;
	s = min(s, 1.0);

	if(best_i == 0u)
		best_i = 1u;

	best/=s*float(best_i);

	fragColor = vec4(s, s, s, 1)
	* vec4(rainbow(aa
				   +float(best_i)/float(max_iterations)*best), 1.0);
}`;

let editor_div = document.getElementById("editor");

var run_editor = function()
{
	const header_code =
	`#version 300 es
	precision highp float;

	#define complex vec2

	in vec2 z0;

	out vec4 fragColor;

	vec2 mul(vec2 c1, vec2 c2){
		return vec2(c1.x*c2.x - c1.y*c2.y, c1.x*c2.y + c1.y*c2.x);
	}

	vec2 div(vec2 c1, vec2 c2){
		float den = c2.x*c2.x + c2.y*c2.y;
		return vec2((c1.x*c2.x + c1.y*c2.y)/den, (c1.y*c2.x - c1.x*c2.y)/den);
	}

	float mag2(vec2 c){
		return c.x*c.x + c.y*c.y;
	}

	float mag(vec2 c){
		return sqrt(mag2(c));
	}

	float arg(vec2 c){
		return 2.0 * atan(c.y / (c.x + sqrt(mag2(c))));
	}

	float arg_norm(vec2 c){
		return arg(c)/6.28318530718 + 0.5;
	}

	vec2 conj(vec2 z)
	{
		return vec2(z.x, -z.y);
	}

	uniform float u_time;
`
	const header_length = header_code.match(/\n/g).length;

	var full_code = header_code + editor.state.doc;
	var status = compile_frag_shader(full_code);

	status.errors.forEach(err => err.line-=header_length);
	status.warnings.forEach(war => war.line-=header_length);

    UpdateLints(editor, status.errors, status.warnings);

	render();
}

let keymaps = [{key:"Alt-Enter", run: run_editor}];

let state = EditorState.create({
    doc : initial_program,
    extensions: [javascript(), keymap.of(keymaps), lintGutter(), basicSetup, EditorView.lineWrapping]
  })
  
let editor = new EditorView({
    state,
    parent: editor_div
})

run_editor(editor.state.doc);