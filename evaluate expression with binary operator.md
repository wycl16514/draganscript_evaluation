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
        //only support comparison for number
        if (leftRes.type !== "number" || rightRes.type !== "number") {
            throw new Error("only support comparion for number")
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
                throw new Error(`comparison recursive for unknown operator ${node.attributes.value}`)
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
        if (leftRes.type === "NIL" && rightRes.type === "NIL") {
            node.evalRes = {
                type: type,
                value: true,
            }
        }

        if (leftRes.type !== rightRes.type) {
            //we may handle nil and class install in futhure
            throw new Error("only support equality comparsion for the same type")
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
                    value: leftRes.value !== rightRes
                }
                break
            default:
                throw new Error(`equality recursive for unknown operator: ${node.attributes.value}`)
        }
        this.attachEvalResult(parent, node)
    }
```
After adding the above code, we can make sure our newly added test case can be passed


