We have built up the basic code evaluation process and evaluate some simple expression like literal number and string , we can do evaluation for more complex expression by adding more code to our 
process, let's see how we can evaluate a literal number or string in parentheses, first we check its AST have a first hand idea about the process for evaluation, run the command in our console 
and you will get the following tree:
![截屏2024-04-19 12 56 44](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/d64c37bd-3765-453d-854c-e1eb5ce18bef)

we found a bug here, the tree contains a node for left parenthese but not the right parenthese, by the parsing rule primary -> "(" expression ")", we don't care too much about the left and 
right parenthese when evaluating, we only need to do is evaluate the the child node of expression and pass the result to the node of primary, therefore we can change the code in primary like following:
```js
 primary = (parentNode) => {
    ....
     //fix bug here
        const primary = this.createParseTreeNode(parentNode, "primary")
        /*
        if it is left parenthese, then we set the node value to grouping
        and append the expression as the child node of primary
        */
        if (token.lexeme === '(') {
            primary.attributes = {
                value: "grouping",
            }
        } else {
            primary.attributes = {
                value: token.lexeme,
            }
            primary.token = token
        }

        parentNode.children.push(primary)
        this.advance()
      ....
}
```
After the above change, the tree turns into this:

![截屏2024-04-19 13 16 48](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/463c7ef3-c857-4388-88bb-d4a3cd022366)

Let's add the testing case for evaluation the tree above:
```js
 it("should evaluate string or number literal in parenthese", () => {
        let root = createParsingTree("(12.34);")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 12.34,
        })

        root = createParsingTree('("hello world!");')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })
```
run "npm run test" and make sure the test case fail and we add code to satisfy it, we change the code for visitPrimaryNode like following:
```js
visitPrimaryNode = (parent, node) => {
     /*
        if the primary node is grouping, we need to evaluate its child
        */
        if (node.attributes.value === "grouping") {
            this.visitChildren(node)
            this.attachEvalResult(parent, node)
            return
        }
    ....
}
```
By using the above modified code, we can make sure the newly added test case can be passed. Now let's try to evaluate a little bit more complex expression that is unary expression like 
-1.2, +3.14, !true, we check its AST first, run command like following:

recursiveparsetree -1.2;

Then we get a tree like following:

![截屏2024-04-19 13 47 11](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/5cc63a84-9652-4791-9453-79fc04c4c5e9)

The structure of the tree is a liitle bit strange, because an empty unary node as the child of unary_recursive, the problem lies at how we adjust the tree, we only need to adjust the tree for binary
operation like +, -, *, /, >=, <= , we don't need to adjust it for unary operation, therefore we remove the code in visitUnaryRecursiveNode of TreeAdjustVisitor like following:
```js
 visitUnaryRecursiveNode = (parent, node) => {
        //we don't need to adjust the tree for unary operation
        // this.interChangeParentChild(parent, node)
        // this.visitChildren(node)
        node.parent = parent
        this.visitChildren(node)
    }
```
Draw the tree again and we get the following result and it looks more regular than before:

![截屏2024-04-19 13 54 10](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/b94ad2e8-957e-486f-9867-29558fdd8521)

Now we can add test cases for unary expression, the first one is unary number literal:
```js
 it("should evaluate unary operator -  number literal", () => {
        let root = createParsingTree("-12.34;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: -12.34,
        })
    })
```
run tests and makre sure it fail, then we can add following code to satisfy the case:
```js
 visitUnaryRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        if (node.attributes.value === "-") {
            node.evalRes.value = - node.evalRes.value
        }
        this.attachEvalResult(parent, node)
    }
```
the change for above code an satisfy the test case, let's test another operatoer that is "!" :
```js
 it("should evaluate unary operator ! for true and false boolean", ()=> {
        let root = createParsingTree("!true;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree("!false;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })
```
The case above is sure to fail, let's add code to make it passed:
```js
visitPrimaryNode = (parent, node) => {
    ...
    switch (token.token) {
    ...
    case Scanner.TRUE:
        type = "boolean"
        value = true
        break
     case Scanner.FALSE:
         type = "boolean"
         value = false
         break
        }
      ...
}

visitUnaryRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        if (node.attributes.value === "-") {
            node.evalRes.value = - node.evalRes.value
        }

        if (node.attributes.value === "!") {
            node.evalRes.value = !node.evalRes.value
        }

        this.attachEvalResult(parent, node)
    }
```
Adding the code above we can make sure the newly added test case passed. Now comes to the question, how to handle something like -"hello world!" and
!1.23 ?

