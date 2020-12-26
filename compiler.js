"use strict";

function tokenizer(input) {
  let current = 0;
  let SPACES = /\s/;
  let NUMBERS = /[0-9]/;
  let LETTERS = /[a-z]/i;
  let tokens = [];
  let pcount = 0
  for(var it=0 ; it!=input.length;it++)
  {
    if(input[it]=='(')
    pcount++;
    if(input[it]==')')
    pcount--;
  }
  if(input[0]!=='(' || pcount!=0)
      throw '0'
  while (current < input.length) {
    let char = input[current];
    if (char === "(") {
      tokens.push({
        type: "parenthesis",
        value: "(",
      });
      current++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "parenthesis",
        value: ")",
      });
      current++;
      continue;
    }

    if (SPACES.test(char)) {
      current++;
      continue;
    }

    if (NUMBERS.test(char) || char==='-' || char==='.') {
      let value = "";

      while (NUMBERS.test(char) || char==='-' || char==='.') {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: "number", value });

      continue;
    }

    // if (char === '"') {
    //   let value = "";
    //   char = input[++current];
    //   while (char !== '"') {
    //     value += char;
    //     char = input[++current];
    //   }
    //
    //   char = input[++current];
    //
    //   tokens.push({ type: "string", value });
    //
    //   continue;
    // }

    if (LETTERS.test(char)) {
      let value = "";
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: "keyword", value });

      continue;
    }

    throw '1';
  }

  return tokens;
}

function parser(tokens) {
  let current = 0;
  function parse() {
    let token = tokens[current];
    if (token.type === "number") {
      current++;

      return {
        type: "Number",
        value: token.value,
      };
    }

    if (token.type === "parenthesis" && token.value === "(") {
      token = tokens[++current];

      let node = {
        type: "Expression",
        keyword: token.value,
        params: [],
      };

      token = tokens[++current];
      while (
        token.type !== "parenthesis" ||
        (token.type === "parenthesis" && token.value !== ")")
      ) {
        node.params.push(parse());
        token = tokens[current];
      }

      current++;
      return node;
    }
  }

  let pt = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    pt.body.push(parse());
  }

  return pt;
}


function traverser(pt, visitor) {
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }

  function traverseNode(node, parent) {
    let methods = visitor[node.type];
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }

    switch (node.type) {
      case "Program":
        traverseArray(node.body, node);
        break;

      case "Expression":
        traverseArray(node.params, node);
        break;
      case "Number":
        break;

      default:
        throw new TypeError(node.type);
    }
  }

  traverseNode(pt, null);
}


function generateAst(pt) {
  let astree = {
    type: "Program",
    body: [],
  };

  pt._context = astree.body;
  traverser(pt, {
    Number: {
      enter(node, parent) {
        parent._context.push({
          type: "Number",
          value: node.value,
        });
      },
    },

    Expression: {
      enter(node, parent) {
        let expression = {
          type: "Expression",
          callee: {
            type: "Identifier",
            keyword: node.keyword,
          },
          arguments: [],
        };
        node._context = expression.arguments;
        if (parent.type !== "Expression") {
          expression = {
            type: "ExpressionStatement",
            expression: expression,
          };
        }
        parent._context.push(expression);
      },
    },
  });
  return astree;
}

function codeGenerator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("\n");

    case "ExpressionStatement":
      return (
        codeGenerator(node.expression) + ";"
      );

    case "Expression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    case "Identifier":
      return node.keyword;
    case "Number":
      return node.value;

    default:
      throw new TypeError(node.type);
  }
}

function calculate(string){
    const removeExtra = (string, character) => {
       const stringList = string.split(character);
       const cleanString = stringList.join(" ");
       return cleanString;
    }
    const str = removeExtra(string, '(');
    const str1 = removeExtra(str, ')');
    const str3 = removeExtra(str1, ';');
    const program = removeExtra(str3, ',');

  const preprocess = str => str.split(' ').map(s => s.trim()).filter(s => s.length);
  const Operator = Symbol('op');
  const Number = Symbol('num');

  const check = tokens => {
    let c = 0;
    const getToken = () => tokens[c];
    const nextToken = () => tokens[c++];

    const parseNum = () => {

      return {val: parseFloat(nextToken()), type: Number} };

    const parseOp = () => {
      const node = { val: nextToken(), type: Operator, expr: [] };
      while (getToken()) node.expr.push(parseExpr());
      return node;
    };

    const parseExpr = () => /[+-]?([0-9]*[.])?[0-9]+/.test(getToken()) ? parseNum() : parseOp();

    return parseExpr();
  };
  const evaluate = ast => {

    const opAcMap = {
      add: args => args.reduce((a, b) => a + b, 0),
      subtract: args => args.reduce((a, b) => a - b),
      divide: args => args.reduce((a, b) => a / b),
      multiply: args => args.reduce((a, b) => a * b, 1),
      mod: args => args.reduce((a, b) => a % b),
      power: args => args.reduce((a, b) => Math.pow(a,b)),
      sqrt: args => Math.sqrt(args),
      log: args => Math.log10(args),
      ln:args => Math.log(args)
    };
    if (ast.type === Number) return ast.val;
    console.log(opAcMap[ast.val](ast.expr.map(evaluate)));
    return opAcMap[ast.val](ast.expr.map(evaluate));
  };

  const compile = ast => {
    const opMap = { add: '+', multiply: '*', subtract: '-', divide: '/', mod: '%',power: 'Math.pow()',sqrt: 'Math.pow()',log:'Math.log10()',ln:'Math.log()'};
    const compileNum = ast => ast.val;
    const compileOp = ast => `(${ast.expr.map(compile).join(' ' + opMap[ast.val] + ' ')})`;
    const compile = ast => ast.type === Number ? compileNum(ast) : compileOp(ast);
    return compile(ast);
  };
    return evaluate(check(preprocess(program)));
}

var tokens, pt, ast, output, answer;









  function Token(){

    var input = document.getElementById("input_expression").value.toString();
    try {
    let token_list = tokenizer(input)
    for(let i=0;i<token_list.length;i++)
        {
          //let ans = tokens[i];
          let con1= document.createElement("P");

          let node1= document.createTextNode(JSON.stringify(Object.values(tokenizer(input)[i])).replace(',', ':'));
          let element1= document.querySelector("#token");
          con1.appendChild(node1);
          element1.appendChild(con1);
          //console.log(tokens[i]);
        }


  }
 catch (e) {
  let con1= document.createElement("P");
  let node1;
  if(e=='0')
  {

    node1 = document.createTextNode("Lexical Error: Missing Parenthesis!");
  }
  else
    {
      console.log(e.values);
   node1= document.createTextNode("Lexical Error: Unknown Character!");
    }


  let element1= document.querySelector("#token");
  con1.appendChild(node1);
  element1.appendChild(con1);
}
}


  function Output(){
    //const input = "(power 2 (add 5 (sqrt 4)))";
    //var n = num.toString();
    var input = document.getElementById("input_expression").value.toString();
    //document.getElementById("input_expression").value = input;
    try {
    let con= document.createElement("P");
    let   tokens = tokenizer(input);
    let   pt = parser(tokens);
    let   ast = generateAst(pt);
    let   output = codeGenerator(ast);
    let   answer = calculate(output)

    let node= document.createTextNode(answer);
    let element= document.querySelector("#output");
    con.appendChild(node);
    element.appendChild(con);


  }
catch (e) {
  let con= document.createElement("P");
  let node
  if(e=='0')
  {

    node = document.createTextNode("Lexical Error: Missing Parenthesis!");
  }
  else if(e=='1')
  {
    node= document.createTextNode("Lexical Error: Unknown Character!");

  }
  else
    {

        node = document.createTextNode("Syntax Error: Please check your input!");
    }

  //let node= document.createTextNode("Error! Bad Input");
  let element= document.querySelector("#output");
  con.appendChild(node);
  element.appendChild(con);
}
}

  function Parsetree(){
    var input = document.getElementById("input_expression").value.toString();
    try {
    var token_s = tokenizer(input);
    var ptf = parser(token_s);
    var ptl = JSON.stringify(ptf).split(",");
    var tem = "";
    var tot = "";
      let con2= document.createElement("P");
    for(var iter=0;iter<ptl.length;iter++)
    {
      let node2= document.createTextNode(ptl[iter]);

        let element2= document.querySelector("#parsetr");
        con2.appendChild(node2);
        // con2.appendChild(document.createNode('br'));
        element2.appendChild(con2);
        var br = document.createElement("br");
        con2.appendChild(br);
        //document.write("<br>");
    }
  }
 catch (e) {
  let con2= document.createElement("P");
  let node2= document.createTextNode("Error! Bad Input");
  let element2= document.querySelector("#parsetr");
  con2.appendChild(node2);
  element2.appendChild(con2);
}
}
let compile = document.querySelector(".compile");
compile.addEventListener("click", Output);

let tokeni = document.querySelector(".tokeni");
tokeni.addEventListener("click", Token);

let parsei = document.querySelector(".parsei");
parsei.addEventListener("click", Parsetree);
