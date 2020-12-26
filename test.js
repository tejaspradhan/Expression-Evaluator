const {
  tokenizer,
  parser,
  generateAst,
  codeGenerator,
  compiler,
} = require("./compiler.js");

function printTokens(input){
  tokens = tokenizer(input);
  for(var i=0;i<tokens.length;i++)
  {
    console.log(tokens[i]);
  }
  console.log("\n");

}

function showParseTree(input){
  parsetree = parser(tokenizer(input));
  console.log("here "+typeof(parsetree))
  parsetreelist = JSON.stringify(parsetree).split(",");
  console.log("hh "+parsetreelist +" hh");
  for(var i=0;i<parsetreelist.length;i++)
  {
    console.log(parsetreelist[i]);
  }
  console.log("\n");

}

function showAst(input){

  astree = generateAst(parser(tokenizer(input)))
  //console.log(JSON.stringify(astree));
  astreelist = JSON.stringify(astree).split(",");
  for(var i=0;i<astreelist.length;i++)
  {
    console.log(astreelist[i]);
  }
  console.log("\n");

}

const assert = require("assert");
const input = "(add 4 (add 3 (subtract 4 7)))";
console.log("\n");
try {
  printTokens(input);
  showParseTree(input);
  showAst(input);
  console.log(compiler(input));
} catch (e) {
  console.log("Synt Err");
  return;
}


//console.log(compiler(input));
// const input = "(add 3 (sqrt 16))";
// const output = "add(2, subtract(4, 2));";
// //console.log("input: " + input);
// console.log("tokenizer:" + tokenizer(input));
// // console.log("parser:" + parser(tokenizer(input)));
// // console.log("transformer:" + transformer(parser(tokenizer(input))));
// // console.log("codeGenerator:" + codeGenerator(transformer(parser(tokenizer(input)))));
