After finishing the unary operator, let's see how we can do the same job for binary operator. In previous sections, we deviced the tree adjust vistor to reconstruct the tree. The target for the readjustment is for
binary operator, we wish the node for the operator can be parent for its two operands. In this section we will see how the adjustments bring benifits to our evaluation.

We should draw the AST tree for binary operator first to gain some intuitions for our later evaluation, run the command like recursivparse tree for 1.32+2.46; then we will get the tree structure like following:
![截屏2024-04-21 12 52 18](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/b604ae5d-6ff0-4fca-b462-0a1f819672c6)

we can see from the tree that, the node for operator "+" is the parent of two operand nodes that are extend themself to primary node with value 1.23 and 2.46 respectively, when we evaluate such epression, we can
reach to the primary node, extract its value, send the value up to theiry term node, and when we come to the term_recursive node with oerpator, we add the right action according to the operator at the node.

First we handle the case for operator +, - , we add the testing case first:
```js
 it("should evaluate binary operator +,-,*,/, correctly", () => {
        let root = createParsingTree("1.23+2.46;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 3.69,
        })

        root = createParsingTree("2.46-1.23;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })

        root = createParsingTree("2 * 1.23;")
     
    })
```
Run the test and make sure it fails, then we can add code to satisfy it, according to the AST above, in intepretor.js we do the following:
```js
visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        /*
        get evaluation result from its children and combine those results 
        into one according to the operator
        */
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        if (leftRes.type !== rightRes.type) {
            /*
            we will handle binary operation on different type such as 123+"hello, world"
            in later sections
            */
            throw new Error(`binary operation on different type for ${leftRes.type} and ${rightRes.type}`)
        }
        let type = "number"
        switch (node.attributes.value) {
            case "+":

                node.evalRes = {
                    type: type,
                    value: leftRes.value + rightRes.value
                }

                break
            case "-":
                node.evalRes = {
                    type: type,
                    value: leftRes.value - rightRes.value
                }
                break
          
            default:
                throw new Error(`unknown operator for term_recursive: ${node.attributes.value}`)
        }

        this.attachEvalResult(parent, node)
    }

```
After changing the code above, we expect the test case can be passed but actually it still fail, the problem lies in the parent and node for the visitTermRecursiveNode method, the parent and node is alread fixed 
in  addAcceptForNode of RecursiveDecentParser that is before we adjusting the tree structure, therefore when it comes to term_recursive node, it still be the child of term node, that is when we are calling 
visitTermRecursiveNode in interpreter, the parameter of parent is term node, we need to change this when we changing the relationship between term and term_recursive, therefore we do the following changes:
```js
interChangeParentChild = (parent, child) => {
        //interchange the position of parent and child
        const grandFather = parent.parent
        let idx = this.findNodeInChildren(grandFather, parent)
        grandFather.children[idx] = child
        //fix the parent should be the first child
        //child.children.push(parent)
        child.children.unshift(parent)
        //remove child from parent
        idx = this.findNodeInChildren(parent, child)
        parent.children.splice(idx, 1)

        /*
        after interchange, parent becomes the child of the input child
        and we need to readjust tis accept method
        */
        this.parser.addAcceptForNode(grandFather, child)
        this.parser.addAcceptForNode(child, parent)
    }
```
After the above changes, we can make sure the newly added test case can be passed. Let's see how can we evaluate operator * and /, 
first we draw its AST tree like following:

![截屏2024-04-22 15 39 50](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/0f9d387b-0efd-441f-9764-eb5bf4f98fb1)

First we should add the test case first and make sure it fail:
```js
 it("should evaluate binary operator * and / correctly", () => {
        let root = createParsingTree("1.23 * 2;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 2.46,
        })

        root = createParsingTree("2.46 / 1.23;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 2,
        })
    })
```

From the tree we know we need to handle the operation at node factor_recursive, therefore we will add code like following:
```js
 visitFactorRecursviNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes
        if (leftRes.type !== rightRes.type) {
            //we will handle operation on different type later on
            throw new Error(`can't do operation ${node.attributes.value} on type:${leftRes.type} and ${right.type}`)
        }

        const type = "number"

        switch (node.attributes.value) {
            case '*':
                node.evalRes = {
                    type: type,
                    value: leftRes.value * rightRes.value
                }
                break
            case '/':
                node.evalRes = {
                    type: type,
                    value: leftRes.value / rightRes.value
                }
                break
            default:
                throw new Error("factor recursive should not be here")
        }

        this.attachEvalResult(parent, node)
    }
```
Adding the above code we can make sure the test case can be passed. Let's see how we do evaluation on comparison operator, we still 
draw its AST tree first, run the command :
     recursiveparsetree 2.46>=1.23; 
then we get the following tree:

![截屏2024-04-23 17 16 14](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/e9fe098a-c9ea-4336-a03e-bc48bf190823)

from the tree we know we should handle the case at node comparison_recursive, let's add test case first:
```js
it("should evaluate comparison operator correctly", () => {
        let root = createParsingTree("2.46>1.23;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree("1.23 >= 2.46;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree("2.46 < 1.23;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree("1.23 <= 2.46;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })
```
run "npm run test" and make sure the case fail and we add code to make it pass, in intepreter.js add the following code:
```js
 visitComparisonRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes
        if (leftRes.type !== "number" || rightRes.type !== "number") {
            throw new Error("only support comparison for number")
        }
        const type = "boolean"
        switch (node.attributes.value) {
            case "<=":
                node.evalRes = {
                    type: type,
                    value: leftRes.value <= rightRes.value
                }
                break
            case "<":
                node.evalRes = {
                    type: type,
                    value: leftRes.value < rightRes.value
                }
                break
            case ">":
                node.evalRes = {
                    type: type,
                    value: leftRes.value > rightRes.value
                }
                break
            case ">=":
                node.evalRes = {
                    type: type,
                    value: leftRes.value >= rightRes.value
                }
                break
            default:
                throw new Error(`comparison recursive for unknown operator: ${node.attributes.value}`)
        }
        this.attachEvalResult(parent, node)
   }
```
By adding the above code we can make sure the newly add test case can be passed. Finally let's handle equality operatior, we draw its parsing tree
by following command:
recursiveparsetree 1.24==2.46;
then we get the following tree:
![截屏2024-04-23 18 07 07](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/de2cd6dc-826d-446f-ac80-d94e50b5b027)

we add the test case first like following:
```js
 it("should evaluate equality operator correctly", () => {
        let root = createParsingTree("2.46 == 1.23;")
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree("2.46 != 1.23;")
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
})
```
run the case and make sure it fail then we add the following code:
```js
 visitEqualityRecursvieNode = (parent, node) => {
         this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes
        const type = "boolean"
        if (leftRes.type === "nil" && rightRes.type === "nil") {
            node.evalRes = {
                type: type,
                value: true
            }
        } else {
            if (leftRes.type !== rightRes.type) {
                //nil and class instance in futhure
                throw new Error("only support equality comparison for the same type")
            }
            switch (node.attributes.value) {
                case "==":
                    node.evalRes = {
                        type: type,
                        value: leftRes.value === rightRes.value
                    }
                    break
                case "!=":
                    node.evalRes = {
                        type: type,
                        value: leftRes.value !== rightRes.value
                    }
                    break
                default:
                    throw new Error(`equality recursive for unkonwn operator ${node.attributes.value}`)
            }
        }

        this.attachEvalResult(parent, node)
    }
```
After adding the above code, we can make sure our newly added test case can be passed. Finally let's add support for operation of * and + on number
and string, and report error if operation can't support type of number and string, first let's add the following test case:
```js
 it("should support number and string for operator * and +", () => {
        let root = createParsingTree('3 + "hello,world!";')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "3hello,world!",
        })

        root = createParsingTree('3 *"hello,";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,hello,hello,",
        })
    })
```
when we add a number with string, we convert the number into string and do connect them into one string, this is the approch for js, and if a 
number multiply with a string, then we repeat the string with given times, this is the approch for python, run the test make sure it fail and 
we add code in intepreter.js to make it passed:
```js
 typeIncompatibleError = (leftRes, rightRes, op) => {
        if (leftRes.type !== rightRes.type) {
            /*
            we will handle binary operation on different type such as 123+"hello, world"
            in later sections
            */
            throw new Error(`binary operation on different type for ${leftRes.type} and ${rightRes.type} for operation ${op}`)
        }
    }

visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        /*
        get evaluation result from its children and combine those results 
        into one according to the operator
        */
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        let type = "number"
        switch (node.attributes.value) {
            case "+":
                if (leftRes.type === "number" && rightRes.type === "string") {
                    leftRes.value = leftRes.value.toString()
                    type = "string"
                }
                if (leftRes.type === "string" && rightRes.type === "number") {
                    type = "string"
                    rightRes.value = rightRes.value.toString()
                }

                node.evalRes = {
                    type: type,
                    value: leftRes.value + rightRes.value
                }

                break
            case "-":
                node.evalRes = {
                    type: type,
                    value: leftRes.value - rightRes.value
                }
                break
            default:
                throw new Error(`unknown operator for term_recursive: ${node.attributes.value}`)
        }

        this.attachEvalResult(parent, node)
    }

visitFactorRecursviNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        let type = "number"

        switch (node.attributes.value) {
            case '*':
                if (leftRes.type === "number" && rightRes.type === "string") {
                    type = "string"
                    node.evalRes = {
                        type: type,
                        value: rightRes.value.repeat(leftRes.value)
                    }
                } else if (leftRes.type === "string" && rightRes.type === "number") {
                    type = "string"
                    node.evalRes = {
                        type: type,
                        value: leftRes.value.repeat(rightRes.value)
                    }
                }
                else {
                    node.evalRes = {
                        type: type,
                        value: leftRes.value * rightRes.value
                    }
                }

                break
            case '/':
                node.evalRes = {
                    type: type,
                    value: leftRes.value / rightRes.value
                }
                break
            default:
                throw new Error("factor recursive should not be here")
        }

        this.attachEvalResult(parent, node)
    }
```

In above code, we pull the checking for type into a single function typeIncompatibleError, we will use it for checking incompatible type for 
operation in later, and in visitTermRecursiveNode and visitFactorRecursviNode we allow operation + and * on number and string, adding the above
code, we can make sure the newly added case can be passed.

At the last step, we need to report error for incompatiable type operation, such as we can't subtract a string with a number or subsract a string with another 
string. Let's add the test case first:
```js
it("should report error for incompatible type oeration", () => {
        let root = createParsingTree('"hello" - "world";')
        let intepreter = new Intepreter()
        let runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" - 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" / "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" * "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" == 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" != 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

root = createParsingTree('"hello" < 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <= 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >= 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" > 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()


    })

```

run the case and make sure it fails, then we add code to handle it like following:
```js
    typeIncompatibleError = (leftRes, rightRes, op) => {
        switch (op) {
            case "==":
            case "!=":
                if (leftRes.type !== rightRes.type) {
                    throw new Error(`binary operation on different type for ${leftRes.type} and ${rightRes.type} for operation ${op}`)
                }
                break
             case "*":
                if (leftRes.type !== "number" && rightRes.type !== "number") {
                    throw new Error(`binary operation on different type for ${leftRes.type} and ${rightRes.type} for operation ${op}`)
                }
                break

            case "-":
            case "/":
            case ">":
            case ">=":
            case "<":
            case "<=":
                if (leftRes.type !== "number" || rightRes.type !== "number") {
                    throw new Error(`binary operation on different type for ${leftRes.type} and ${rightRes.type} for operation ${op}`)
                }
                break
        }

    }

 visitTermRecursiveNode = (){
 ...
 this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)
 ..
 }

visitFactorRecursviNode = (parent, node) => {
    ...
   this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)
    ...
}

visitEqualityRecursvieNode = (parent, node) => {
  ...
  this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)
  ...
}

visitComparisonRecursiveNode = (parent, node) => {
   ...
   this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)
   ...
 }
```

After adding the above code we can make sure the test case can be passed

