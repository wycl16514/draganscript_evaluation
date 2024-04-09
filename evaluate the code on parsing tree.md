We have adjusted the parsing tree and make it more suitable for evaluation. In this charpter we dive deep into the process of evaluation. We have seen the evaluation of arithmetic expression before. The
same process can apply to code execution here. After having the parsing tree, we goto the leafs first(the primary nodes), evaluate their values then pass the results upto internal node for further processing.

For example the tree we created at previous:
![截屏2024-04-08 16 31 08](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/e792bac8-7022-4397-b0ee-cfa2f2c39098)

We first goto the leafs that are primary nodes, evaluate their values that are 2 and 1, then we pass these two values to up layer, when they both come to node term_recursive, we do the add operation and
get value 3, then we pass this value up to the root and we finish the whole passing process. Let's implement this process step by step. Just like the tree adjust visitor we created at last section,we create
another visitor for evaluation, created a new file called interpreter.js and add all the visitor methods inside it:
```js
import Scanner from "../scanner/token"
export default class Intepreter {
    constructor() {

    }

    visitChildren = (node) => {
        for (const child of node.children) {
            child.accept(this)
        }
    }

    visitRootNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitStatementNode = (parent, node) => {

        this.visitChildren(node)
    }

    visitExpressionNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitEqualityNode = (parent, node) => {

        this.visitChildren(node)
    }

    visitComparisonNode = (parent, node) => {

        this.visitChildren(node)
    }

    visitEqualityRecursvieNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitComparisonRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitTermNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitFactorNode = (parent, node) => {

    }

    visitFactorRecursviNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitUnaryNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitUnaryRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitPrimaryNode = (parent, node) => {

    }

}
```

Now let's begin to create test cases one by one, create a new test file named intepreter.test.js, add the following code:
```js
import RecursiveDescentParser from '../parser/recursive_descent_parser'
import Intepreter from './intepreter'
import TreeAdjustVisitor from './tree_adjust_visitor'
describe("Testing evaluation for expression", () => {


})
```
We do the test from simple to complex, first we try to evaluate number and string literal , then we add our first test case:
```js
describe("Testing evaluation for expression", () => {
    const createParsingTree = (code) => {
        const parser = new RecursiveDescentParser(code)
        const root = parser.parse()
        const treeAdjustVisitor = new TreeAdjustVisitor()
        root.accept(treeAdjustVisitor)
        return root
    }

    it("should evaluate integer number successfully", () => {
        const root = createParsingTree("1234;")
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1234,
        })
    })

})
```
we can see from the test case that we expect the evaluate result to be a object with field type to indicate the type of evaluation result, for expression we may have type as string, number, boolean,
we will add more when we adding more test cases and evaluate more complex code. Run the test above and make sure it fail. Then we add more code to Intepreter and satisfy the test case:
```js
import Scanner from "../scanner/token"

export default class Intepreter {
    constructor() {

    }

    attachEvalResult = (parent, node) => {
        parent.evalRes = node.evalRes
    }

    visitChildren = (node) => {
        for (const child of node.children) {
            child.accept(this)
        }
    }

    visitRootNode = (parent, node) => {
        //the evaluate result should attach to node here
        this.visitChildren(node)
    }

    visitStatementNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitExpressionNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitEqualityNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitComparisonNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitEqualityRecursvieNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitComparisonRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitTermNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitFactorNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitFactorRecursviNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitUnaryNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitUnaryRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitPrimaryNode = (parent, node) => {
        //get the value from primary node
        const token = node.token
        let type = undefined
        let value = undefined
        switch (token.token) {
            case Scanner.NUMBER:
                type = "number"
                value = parseInt(token.lexeme)
                break
        }

        //attach the evalue result to its parent node
        parent.evalRes = {
            type: type,
            value: value,
        }
    }

}
```
In the above code, when the visitor come to primary node, it gets details from the token of that node and decide what kind of value it should return, if the token with type Scanner.NUMBER, then it knows
the node is for number, and it get the value of the number by converting the lexeme string into integer and setting the evaluation type to "number" then attach the result to its parent node.

When visiting internal nodes ,the visitor just simply attach the evaluation result from the current node to its parent node by using attachEvalResult method, by doing this, the evaluation result will 
cascade from the leaf up to the root of the tree, then we can simple get the evaluate result from the root node, after adding the above code, we can make the test case passed. Let's add more cases:
```js
 it("should evaluate float number successfully", () => {
        const root = createParsingTree("12.34;")
        const intepreter = new Intepreter()
        root.accept(intepreter)
        console.log("eval root: ", root)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 12.34,
        })
    })
```
This time we wish to evaluate a float number but our intepreter can only convert number to integer and of course the test should fail, we need to check whether there is a floating point in the number 
string or not, if there is a "." in the string ,we need to convert it to float number like following:
```js
 visitPrimaryNode = (parent, node) => {
        //get the value from primary node
        const token = node.token
        let type = undefined
        let value = undefined
        switch (token.token) {
            case Scanner.NUMBER:
                type = "number"
                if (token.lexeme.indexOf(".") == -1) {
                    value = parseInt(token.lexeme)
                } else {
                    value = parseFloat(token.lexeme)
                }

                break
        }

        //attach the evalue result to its parent node
        parent.evalRes = {
            type: type,
            value: value,
        }
    }
```
After adding the above code, the second test case can be passed, let's add a third test case:
```js
it("should evaluate string literal successfully", () => {
        const root = createParsingTree('"hello world!"')
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })
```
Run the test and make sure it fails. Then we add code to satisfy the test:
```js
 visitPrimaryNode = (parent, node) => {
        //get the value from primary node
        const token = node.token
        let type = undefined
        let value = undefined
        switch (token.token) {
            case Scanner.NUMBER:
                type = "number"
                if (token.lexeme.indexOf(".") == -1) {
                    value = parseInt(token.lexeme)
                } else {
                    value = parseFloat(token.lexeme)
                }
                break
            case Scanner.STRING:
                type = "string"
                value = token.lexeme
                break
        }

        //attach the evalue result to its parent node
        parent.evalRes = {
            type: type,
            value: value,
        }
    }

```
After adding above code, we can make sure the newly add test case passed.

