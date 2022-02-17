/**
 * 词义对象
 */
interface Token {
  type: "number" | "function" | "leftParenthesis" | "rightParenthesis";
  value: string;
}

/**
 * AST中节点的基本类型
 */
interface ASTNode {
  type: string;
}

/**
 * AST中数字节点
 */
interface ASTNumberNode extends ASTNode {
  value: string;
}

/**
 * AST中函数调用节点
 */
interface ASTFunctionNode extends ASTNode {
  name: string;
  params: Array<ASTNode>;
}

/**
 * AST根节点
 */
interface AST extends ASTNode {
  body: Array<ASTNode>;
}

/**
 * 词义分析器
 * @param input 输入字符串
 * @returns 词义对象数组
 */
export function tokenizer(input: string): Array<Token> {
  /**
   * 按字符进行处理，由于要求很简单，只对下面词义进行解析:
   * - 左小括号
   * - 右小括号
   * - 数值字面量
   * - 函数调用
   * - 空白字符
   */
  const tokens: Token[] = [];
  let currentIndex = 0;
  while (currentIndex < input.length) {
    const currentChar = input[currentIndex];
    /**
     * 左括号
     */
    if (currentChar === "(") {
      tokens.push({
        type: "leftParenthesis",
        value: "(",
      });
      currentIndex++;
      continue;
    }
    /**
     * 右括号
     */
    if (currentChar === ")") {
      tokens.push({
        type: "rightParenthesis",
        value: ")",
      });
      currentIndex++;
      continue;
    }
    /**
     * 数字字面量，数字字面量可能包含一长串数字，
     */
    if (/\d/.test(currentChar)) {
      let numberValue = "";
      numberValue += currentChar;
      currentIndex += 1;
      while (currentIndex < input.length && /\d/.test(input[currentIndex])) {
        numberValue += input[currentIndex];
        currentIndex += 1;
      }
      tokens.push({
        type: "number",
        value: numberValue,
      });
      continue;
    }
    /**
     * 变量名，变量名可能包含一长串字母
     */
    if (/[a-zA-Z]/.test(currentChar)) {
      let nameValue = "";
      nameValue += currentChar;
      currentIndex += 1;
      while (
        currentIndex < input.length &&
        /[a-zA-Z]/.test(input[currentIndex])
      ) {
        nameValue += input[currentIndex];
        currentIndex += 1;
      }
      tokens.push({
        type: "function",
        value: nameValue,
      });
      continue;
    }
    /**
     * 空白字符
     */
    if (/\s/.test(currentChar)) {
      currentIndex += 1;
      continue;
    }
    throw new Error("未处理的数据类型");
  }
  return tokens;
}

/**
 * 将词义对象数组解析为AST
 * @param tokens 词义对象数组
 */
export function parser(tokens: Token[]): AST {
  const ast: AST = {
    type: "program",
    body: [],
  };
  let tokenIndex = 0;
  /**
   * 按照匹配关系返回ASTNode
   */
  function walk() {
    /**
     * 递归的最简化形式：
     *
     *    1. `2`
     *    2. `(add 2 3)`
     *
     * 需要注意，walk 每次运行都会把指针（tokenIndex）向后移动！！！
     */
    let token = tokens[tokenIndex];
    if (token.type === "number") {
      tokenIndex++;
      let node: ASTNumberNode = {
        type: "number",
        value: token.value,
      };
      return node;
    } else if (token.type === "leftParenthesis") {
      tokenIndex++;
      token = tokens[tokenIndex];
      let node: ASTFunctionNode = {
        type: "function",
        name: token.value,
        params: [],
      };
      tokenIndex++;
      while (token.type !== "rightParenthesis") {
        node.params.push(walk());
        token = tokens[tokenIndex];
      }
      tokenIndex++;
      return node;
    } else {
      /**
       * 由于最开始对input的规定，目前是不会走到该分支的
       * 但该结构是为了方便以后进行扩充
       */
      tokenIndex++;
      return {
        type: "others",
      } as ASTNode;
    }
  }
  while (tokenIndex < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
}

/**
 * 根据AST生成目标代码
 */
export function codeGenerator(node: ASTNode): string {
  switch (node.type) {
    case "program":
      return (node as AST).body.map(codeGenerator).join(";\n") + ";";

    case "function":
      const funciton_node = node as ASTFunctionNode;
      return `${funciton_node.name}(${
        funciton_node.params
          .map(codeGenerator)
          .join(", ")
      })`;

    case "number":
      return (node as ASTNumberNode).value;

    default:
      return "未知的节点";
  }
}

const input = "(add 2 (add 3 4))(sub 5 6)";
const tokens = tokenizer(input);
console.log(tokens);
const ast = parser(tokens);
console.log(ast);
const output = codeGenerator(ast);
console.log(output);
