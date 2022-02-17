function tokenizer1(input) {
    const tokens = [];
    let currentIndex = 0;
    while(currentIndex < input.length){
        const currentChar = input[currentIndex];
        if (currentChar === "(") {
            tokens.push({
                type: "leftParenthesis",
                value: "("
            });
            currentIndex++;
            continue;
        }
        if (currentChar === ")") {
            tokens.push({
                type: "rightParenthesis",
                value: ")"
            });
            currentIndex++;
            continue;
        }
        if (/\d/.test(currentChar)) {
            let numberValue = "";
            numberValue += currentChar;
            currentIndex += 1;
            while(currentIndex < input.length && /\d/.test(input[currentIndex])){
                numberValue += input[currentIndex];
                currentIndex += 1;
            }
            tokens.push({
                type: "number",
                value: numberValue
            });
            continue;
        }
        if (/[a-zA-Z]/.test(currentChar)) {
            let nameValue = "";
            nameValue += currentChar;
            currentIndex += 1;
            while(currentIndex < input.length && /[a-zA-Z]/.test(input[currentIndex])){
                nameValue += input[currentIndex];
                currentIndex += 1;
            }
            tokens.push({
                type: "function",
                value: nameValue
            });
            continue;
        }
        if (/\s/.test(currentChar)) {
            currentIndex += 1;
            continue;
        }
        throw new Error("未处理的数据类型");
    }
    return tokens;
}
function parser1(tokens) {
    const ast = {
        type: "program",
        body: []
    };
    let tokenIndex = 0;
    function walk() {
        let token = tokens[tokenIndex];
        if (token.type === "number") {
            tokenIndex++;
            let node = {
                type: "number",
                value: token.value
            };
            return node;
        } else if (token.type === "leftParenthesis") {
            tokenIndex++;
            token = tokens[tokenIndex];
            let node = {
                type: "function",
                name: token.value,
                params: []
            };
            tokenIndex++;
            while(token.type !== "rightParenthesis"){
                node.params.push(walk());
                token = tokens[tokenIndex];
            }
            tokenIndex++;
            return node;
        } else {
            tokenIndex++;
            return {
                type: "others"
            };
        }
    }
    while(tokenIndex < tokens.length){
        ast.body.push(walk());
    }
    return ast;
}
function codeGenerator1(node) {
    switch(node.type){
        case "program":
            return node.body.map(codeGenerator1).join(";\n") + ";";
        case "function":
            const funciton_node = node;
            return `${funciton_node.name}(${funciton_node.params.map(codeGenerator1).join(", ")})`;
        case "number":
            return node.value;
        default:
            return "未知的节点";
    }
}
const input = "(add 2 (add 3 4))(sub 5 6)";
const tokens = tokenizer1(input);
console.log(tokens);
const ast = parser1(tokens);
console.log(ast);
const output = codeGenerator1(ast);
console.log(output);
export { tokenizer1 as tokenizer };
export { parser1 as parser };
export { codeGenerator1 as codeGenerator };
