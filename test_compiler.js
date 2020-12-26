"use strict";

//LEXICAL ANALYSIS
function tokenizer(userInput) {
  // regex
  let NUMBERS = /[0-9]/;
  let SPACES = /\s/;
  let LETTERS = /[a-zA-Z]/i;

  var curr = 0;
  var tokens = [];

  while (curr < userInput.length) {
    var char = userInput[curr];

    // checking for parenthesis
    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });
      curr++;
      continue;
    }

    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      curr++;
      continue;
    }

    // ignore white spaces

    if (SPACES.test(char)) {
      curr++;
      continue;
    }

    if (NUMBERS.test(char)) {
      // till we encounter a space or parenthesis
      var val = "";
      while (NUMBERS.test(char)) {
        val += char;
        curr++;
        char = userInput[curr];
      }
      tokens.push({ type: "number", val });
      continue;
    }
    if (char === '"') {
      let val = "";
      curr++; // skipping th quotes
      char = userInput[curr];

      while (char !== '"') {
        val += char;
        curr++;
        char = userInput[curr];
      }
      char = userInput[++curr];

      tokens.push({ type: "string", val });

      continue;
    }

    if (LETTERS.test(char)) {
      let val = "";
      while (LETTERS.test(char)) {
        val += char;
        curr++;
        char = userInput[curr];
      }
      tokens.push({ type: "name", val });
      continue;
    }

    throw new TypeError("Encountered unknown character " + char);
  } //end of while loop

  return tokens;
} // end of tokenizer function

//PARSING
function parser(tokens) {
  var curr = 0;

  function parse() {
    var token = tokens[curr];

    //check for string
    if (token.type === "number") {
      curr++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    // check for string.

    if (token.type === "string") {
      curr++;

      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    // check for open parenthesis.
    if (token.type === "paren" && token.value === "(") {
      curr++;
      token = tokens[curr];
      let node = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };

      token = tokens[curr++];

      while (
        token.type !== "paren" ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(parse());
        token = tokens[curr];
      }
      curr++;
      return node;
    }

    throw new TypeError(token.type); // if we find no match
  }

  let ast = {
    type: "Program",
    body: [],
  };

  while (curr < tokens.length) {
    ast.body.push(parse());
  }
  return ast;
}

function traverseAST(ast, visitor) {
  function traverseArray(arr, parent) {
    arr.forEach((child) => {
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

      case "CallExpression":
        traverseArray(node.params, node);
        break;

      case "NumberLiteral":
      case "StringLiteral":
        break;

      default:
        throw new TypeError(node.type);
    }

    if (methods && methods.exit) {
      methods.exit(node, parent);
    }
  }
  traverseNode(ast, null);
}

function transformer(ast) {
  let transformedAst = {
    type: "Program",
    body: [],
  };

  ast._context = transformedAst.body;

  traverseAST(ast, {
    NumberLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "NumberLiteral",
          value: node.value,
        });
      },
    },

    StringLiteral: {
      enter(node, parent) {
        parent._context.push({
          type: "StringLiteral",
          value: node.value,
        });
      },
    },
    CallExpression: {
      enter(node, parent) {
        let expression = {
          type: "CallExpression",
          callee: {
            type: "Identifier",
            name: node.name,
          },
          arguments: [],
        };
        node._context = expression.arguments;

        if (parent.type !== "CallExpression") {
          expression = {
            type: "ExpressionStatement",
            expression: expression,
          };
        }
        parent._context.push(expression);
      },
    },
  });

  return transformedAst;
}

function codeGenerator(node) {
  switch (node.type) {
    case "Program":
      return node.body.map(codeGenerator).join("\n");

    case "ExpressionStatement":
      return codeGenerator(node.expression) + ";";

    case "CallExpression":
      return (
        codeGenerator(node.callee) +
        "(" +
        node.arguments.map(codeGenerator).join(", ") +
        ")"
      );

    case "Identifier":
      return node.name;

    case "NumberLiteral":
      return node.value;

    case "StringLiteral":
      return '"' + node.value + '"';

    default:
      throw new TypeError(node.type);
  }
}

function compiler(input) {
  let tokens = tokenizer(input);
  let ast = parser(tokens);
  let newAst = transformer(ast);
  let output = codeGenerator(newAst);

  return output;
}

module.exports = {
  tokenizer,
  parser,
  traverseAST,
  transformer,
  codeGenerator,
  compiler,
};
