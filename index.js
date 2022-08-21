const argparse = require('argparse');
const version = require("./package.json");
const bf = require("./bf.js"); //to eval bf
const fs = require('fs');
var exec = require('child_process').exec;
var os = require('os');

var log4js = require("log4js");
var logger = log4js.getLogger();
logger.level = "debug";

var parser = new argparse.ArgumentParser({
  description: 'Brain[word] to native binary compiler.'
});

parser.add_argument('-v', '--version', {
  action: 'version',
  version
});
parser.add_argument('-i', '--input', {
  help: 'Specifies a .bf file to parse.'
});
parser.add_argument('-o', '--output', {
  help: 'Specifies a .c file or binary file to write the c output or compiled binary to.'
});
parser.add_argument('-e', '--eval', { 
  help   : 'Evaluates the code before converting to C. Can boost Brain[word] speeds by A LOT.',
  action : argparse.BooleanOptionalAction,
  default: false,
});
parser.add_argument('-c', '--compile', {
  help   : 'Compiles the code after converting to c. Helps performance by not using a tape during execution.',
  action : argparse.BooleanOptionalAction,
  default: false,
});
parser.add_argument('-a', '--architecture', {
  help   : 'Specifies the architecture to compile for. Format: <linux|windows>-<x32|x64>',
  nargs  : '?',
  default: 'windows-x64'
});
parser.add_argument('-w', '--wwid', {
  help   : 'Explains what exactly the code does.',
  action: argparse.BooleanOptionalAction,
  default: false
});
parser.add_argument('-s', '--simple', {
  help   : "For WWiD: Just give the output. Don't do anything else.",
  action: argparse.BooleanOptionalAction,
  default: false
});
parser.add_argument('-p', '--preproc', {
  help   : "Use the built-in bf2c preprocessor.",
  action: argparse.BooleanOptionalAction,
  default: false
})

var args = parser.parse_args();

var content = fs.readFileSync(args.input).toString();

var c = "";

if (args.preproc)
  content = bf.Preproc(content, args.input);

if (args.wwid) {
  if (args.simple) {
    var txt = bf.Evaluate(content, logger).evaluate();
    console.log("Output: " + txt);
  } else {
    var wwid = bf.WWiD(content, logger);
    for (var x of wwid) {
      console.log(x);
    }
  }
}

if (args.eval) {
  if (content.includes(','))
    logger.warn("The evaluator will set cells requiring user input statements to a random number.");
  var evaled = bf.Evaluate(content, logger);
  if ((evaled !== null) && (evaled !== undefined)) {
    c = `#include <stdio.h>
int main() {printf("${evaled.replace('"', '\\"')}");return(0);}`;
  } else {
    logger.error('Error occured while evaluating code.');
    return;
  }
} else {
  var compiled = bf.Compile(content, logger);
  if ((compiled !== null) && (compiled !== undefined)) {
    c = compiled;
  } else {
    logger.error('Error occured while compiling code.');
    return;
  }
}

var archs = {
  "windows-x64" : "x86_64-w64-windows-gnu",
  "windows-x32" : "i386-win32-windows-gnu",
  "linux-x64"   : "aarch64-linux-gnu",
  "linux-x32"   : "aarch32-linux-gnu"
}

var arch = "";

for (var x of Object.entries(archs)) {
  if (args.architecture === x[0])
    arch = x[1];
}

if (!args.compile && !args.wwid) {
  fs.writeFileSync(args.output, c);
} else if (!args.wwid && args.compile) {
  var name = "temp.c";
  fs.writeFileSync(name, c);
  var ch = exec('clang ' + name + ' -O3 -o '+args.output+' --target=' + arch);
  ch.on('exit', function (code) {
    if (code === 0) {
      logger.info('Compiled successfully.');
      fs.unlinkSync(name);
    } else
      logger.error('Not compiled, exited with code ' + code.toString());
  });
  ch.stdout.on('data', function (data) {
    logger.info(data.toString());
  });
  ch.stderr.on('data', function (data) {
    logger.info(data.toString());
  });
}