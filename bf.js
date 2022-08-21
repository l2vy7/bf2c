var fs = require("fs");
var brnfckr = require("brnfckr");
var path = require("path");

function Lint(code) {
  let tokens = Array.from(code);

  var full = true;

  var errors = [];

  for (var i = 0; i < tokens.length; i++) {
    if (tokens[i] === "[") {
      var enclosed = false;
      for (var token of tokens.slice(i + 1, tokens.length)) {
        if (enclosed === null) break;
        if (token === "]") {
          enclosed = true;
          break;
        }
      }
      if (!enclosed) full = false;
      break;
    } else if (tokens[i] === "]") {
      var enclosed = false;
      for (var token of tokens.slice(0, i - 1)) {
        if (!full) break;
        if (token === "[") {
          enclosed = true;
          break;
        }
      }
      if (!enclosed) full = false;
      break;
    }
  }

  return [full, errors];
}

function altEval(bf_src, logger) {
  var program = bf_src;
  let tape = [];
  let ptr = 0;
  let isLooping = false;
  let loopStack = [];
  let innerLoops = 0;
  let evaled = "";

  for (i = 0; i < program.length; i++) {
    const char = program[i];

    if (isLooping) {
      if (char === "[") innerLoops++;
      if (char === "]") {
        if (innerLoops === 0) isLooping = false;
        else innerLoops--;
      }
      continue;
    }

    switch (char) {
      case "+":
        tape[ptr]++;
        break;
      case "-":
        tape[ptr]--;
        break;
      case ",":
        tape[ptr] = Math.random() * 101;
        break;
      case ".":
        evaled += String.fromCharCode(tape[ptr]);
        break;
      case ">":
        ptr++;
        if (tape[ptr] === undefined || tape[ptr] === null) {
          tape[ptr] = 0;
        }
        tape[ptr] = tape[ptr] || 0;
        break;
      case "<":
        ptr--;
        if (tape[ptr] === undefined || tape[ptr] === null) {
          tape[ptr] = 0;
        }
        tape[ptr] = tape[ptr] || 0;
        break;
      case "[":
        tape[ptr] === 0 ? (isLooping = true) : loopStack.push(i);
        break;
      case "]":
        tape[ptr] !== 0
          ? (i = loopStack[loopStack.length - 1])
          : loopStack.pop();
        break;
      default:
        break;
    }
  }
}

function Evaluate(code, logger) {
  var returns = Lint(code);

  if (!returns[0]) {
    logger.error(returns[1].join("\n"));
    return;
  }

  let tape = [];
  let cell = 0;
  let cur = 0;
  let loop = [];

  var exported = "";

  let tokens = Array.from(code);

  for (const token of tokens) {
    cur++;
    process.stdout.write(token);
    switch (token) {
      case ">":
        cell++;
        break;
      case "<":
        cell--;
        break;
      case "+":
        if (!tape[cell]) tape[cell] = 0;
        tape[cell]++;
        break;
      case "-":
        if (!tape[cell]) tape[cell] = 0;
        tape[cell]--;
        break;
      case ".":
        if (!tape[cell]) tape[cell] = 0;
        exported += String.fromCharCode(tape[cell]);
        break;
      case "!":
        if (!tape[cell]) tape[cell] = 0;
        exported += tape[cell];
        break;
      case "[":
        if (tape[cell] !== 0) {
          loop.push({
            cell: cell,
            cur: cur,
          });
        }
        break;
      case "]":
        if (tape[cell] == 0) {
          loop.pop();
        } else {
          cur = loop.at(-1).cur;
        }
        break;
      case ",":
        tape[cell] = Math.floor(Math.random() * 20);
        break;
    }
  }

  return exported;
}

function Compile(code, logger, with_preproc) {
  var returns = Lint(code);

  if (!returns[0]) {
    logger.error(returns[1].join("\n"));
    return;
  }

  let cur = 0;

  var exported = "char array[30000] = {0};char *ptr = array;";

  let tokens = Array.from(code);

  if (with_preproc) {
    
  }

  var in_c = false;

  for (const i1 in tokens) {
    var token = tokens[i1];
    cur++;
    if ((token === '@') && (token[i + 1] === 'c')) {
      var after = tokens.slice(i + 2);
      for (var x in after)
        if (after.slice(x, 3) === '@bf')
          break;
        else
          exported += after[x];
    }
          
    if (!in_c) {
    switch (token) {
      case ">":
        exported += "++ptr;";
        break;
      case "<":
        exported += "--ptr;";
        break;
      case "+":
        exported += "++*ptr;";
        break;
      case "-":
        exported += "--*ptr;";
        break;
      case ".":
        exported += "putchar(*ptr);";
        break;
      case "!":
        exported += "putchar(ptr);";
        break;
      case "[":
        exported += "while (*ptr) {";
        break;
      case "]":
        exported += "}";
        break;
      case ",":
        exported += "*ptr = getchar();";
        break;
    }
    }
  }

  return `#include <stdio.h>
int main() {${exported}return 0;}`;
}

function WWiD(code, logger) {
  let cur = 0;

  var exported = [];

  let tokens = Array.from(code);
  let output = "";
  let outputNum = "";

  let duracell = 0;
  let cells = new Array(30000).fill(0);

  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    cur++;
    switch (token) {
      case ">":
        duracell += 1;
        exported.push(
          "(>) Move a cell forward, putting you at cell " +
            duracell.toString() +
            (duracell.toString().includes("-")
              ? " This is not a valid cell."
              : ".")
        );
        break;
      case "<":
        duracell -= 1;
        exported.push(
          "(<) Move a cell backward, putting you at cell " +
            duracell.toString() +
            (duracell.toString().includes("-")
              ? " This is not a valid cell."
              : ".")
        );
        break;
      case "+":
        cells[duracell] += 1;
        exported.push(
          "(+) Increase the cell (cell " +
            duracell.toString() +
            ") by 1, so the value is " +
            cells[duracell].toString()
        );
        break;
      case "-":
        cells[duracell] -= 1;
        exported.push(
          "(-) Decrease the cell (cell " +
            duracell.toString() +
            ") by 1, so the value is " +
            cells[duracell].toString()
        );
        break;
      case ".":
        exported.push("(.) Print the cell's value");
        output = output.concat(String.fromCharCode(cells[duracell]));
        break;
      case "!":
        exported.push("(!) Print the cell's value (number).");
        outputNum += cells[duracell].toString();
        break;
      case "[":
        exported.push(
          "([) Loop the following instructions until the current cell's value is zero."
        );
        break;
      case "]":
        exported.push(
          "(]) End the loop and, when finished, continue the next instructions."
        );
        break;
      case ",":
        exported.push(
          "(,) Set the current cell's value to a number that the user chooses."
        );
        break;
    }
  }

  var txt = altEval(code, logger);

  exported.push("Final output: " + txt);

  return exported;
}

function Preproc(code, fpath) {
  var regexes = {
    import: /\@import \"(.*)\"\;\n/g,
    compress: /\@compress\;\n/g,
  };

  var imports = [...code.matchAll(regexes.import)];
  var compress = regexes.compress.test(code);

  var pre = code
    .replaceAll(regexes.compress, "")
    .replaceAll(regexes.import, "");

  var codes = [];

  var patha = path.dirname(fpath);

  imports.forEach((imp) => {
    var file = fs
      .readFileSync(path.join(patha, imp[1]))
      .toString();
    codes.push(file);
  });

  pre = codes.join("") + pre.replace("\n", "");

  if (compress) pre = brnfckr.minify(pre);

  return pre;
}

module.exports.Evaluate = altEval;
module.exports.Compile = Compile;
module.exports.WWiD = WWiD;
module.exports.Preproc = Preproc;
