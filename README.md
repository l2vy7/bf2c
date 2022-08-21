<div align="center">
    <img width="25%" src="https://i.insider.com/56eae5a4dd0895cb5b8b456d?width=750&format=jpeg&auto=webp">
    <h3>bf2c</h3>
</div>

<h4>Features</h4>
<ul>
     <li>Compiler</li>
     <li>Transpiler</li>
     <li>Explainer</li>
     <li>Evaluator</li>
     <li>Preprocessor</li>
     <li>Linter (using a custom version of Bento)</li>
</ul>

<h3>Feature explanation</h3>
<h4>Compiler</h4>
<p>Compiles your code to a binary file that works on Linux or Windows</p>
<p>Run like:</p>
<code>
bf2c -i ./hworld.bf -o ./hworld.(exe, any extension) -c -a (can be one of linux-x64, linux-x32, windows-x64, windows-x32)
</code>

<h4>Transpiler</h4>
<p>Converts your code to C (help from Wikipedia)</p>
<p>Run like the compiler without -a or -c</p>
<code>
bf2c -i ./hworld.bf -o ./hworld.c
</code>

<h4>Explainer</h4>
<p>Explains what your code does.</p>
<p>Run like:</p>
<code>
bf2c -i ./hworld.bf -w (-s can be used if the code is VERY long.)
</code>

<h4>Evaluator</h4>
<p>Evaluates your code before compilation to make the code run faster.</p>
<p>Run like:</p>
<code>
bf2c -i ./hworld.bf -e -o ./hworld.c
</code>
<p>Compatible with compiler and preprocessor. I promise.</p>

<h4>Preprocessor</h4>
<p>Allows you to:</p>
<ul>
    <li>Include other files</li>
    <li>Define methods</li>
    <li>Compress code</li>
    <li>Directly call C code from the compiler</li>
</ul>
<p>Run like:</p>
<code>
bf2c -i ./hworld.bf -p -o ./hworld.c
</code>
<p>Use like:</p>
<code>
@compress;
@include "./whatever/extension.bf";

@method helloWorld();
@c;
  printf('Hello, World!');
@bf;
@return;
</code>

