From this charpter, we begin our journey on evaluation of the code base on AST built by parser at last charter. First we need to fix a bug we left at last section:
```js
equality = (parentNode) => {
        //equality -> comparison equality_recursive
        const equNode = this.createParseTreeNode("equality")
        this.comparison(equNode)
        this.equalityRecursive(equNode)
        //fix bug here,should add equNode instead of parent node
        parentNode.children.push(equNode)
    }

termRecursive = (parentNode) => {
        const opToken = this.matchTokens([Scanner.MINUS, Scanner.PLUS])
        if (opToken === null) {
            //term_recursive -> epsilon
            console.log("term recursive epsilon")
            return
        }
        //adjust here
        //term_recursive ->  ("-" | "+") term
        const opNode = this.createParseTreeNode("term_recursive")
        //fix
        opNode.attributes = {
            value: opToken.lexeme,
        }
        opNode.token = opToken
        parentNode.children.push(opNode)
        this.advance()
        this.term(opNode)
    }
```
Let's try to draw the parsing tree for expression "1+2;", add the following code at terminal.jsx:
```js
recursiveparsetree: {
            description: 'creating a arithmetic parse tree.',
            usage: "usage recursiveparsetree <string>",
            fn: (...args) => {
                const parser = new RecursiveDescentParser(args.join(' '))
                let res = ''
                try {
                    console.log("run command recursiveparsetree")
                    const root = parser.parse()
                    console.log("parse tree root: ", root)
                    setParseTree(root)
                    setShowTerminal(false)
                }
                catch (err) {
                    res = err.message
                }
                return res.parseResult
            }
        },
```
Now we add using the following command to draw the AST:
![截屏2024-04-08 12 50 13](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/3b9e44a9-ec7b-4850-8365-465379489ed2)

and the tree structure is like following:
![截屏2024-04-08 13 35 29](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/0f3ee129-2d13-4ed5-9d14-34149f741805)


There is a problem for the tree, that is we wish the term_recursive node is better to be the parent of two term node, how can we change the tree structure? We can change the code in the class of 
RecursiveDescentParser, but that would request ask to make lots of change in the code and very likely that changes will break our logics, can we do better? Of course here we can use the
design pattern of visitor.

There is theory of this pattern in the book <<design pattern>> written by the "bang of four", we won't dive into the detail here, actually we can know this pattern by using it. Simply put it,
in object orient programming, we group data and methods into a class, for visitor pattern, we just split methods out and put them into another class, let's have a try. Create a folder name 
"evaluator" in compiler folder, and create a file named tree_adjust_visitor.js and add the following code:
```js
export default class TreeAdjustVisitor {

}
```

we can see the code from RecursiveDescentParser that there are 14 kinds of node it can created: "root", "statement", "expression", "equality", "comparison", "equalityRecursive", "comparisonRecursive",
"term", "termRecursive", "factor", "factorRecursive", "unary", "unaryRecursive", "primary", then we add 14 methods in TreeAdjustVisitor like following:
```js
export default class TreeAdjustVisitor {
    visitRootNode = (parent, node) => { }

    visitStatementNode = (parent, node) => { }

    visitExpressionNode = (parent, node) => { }

    visitEqualityNode = (parent, node) => { }

    visitComparisonNode = (parent, node) => { }

    visitEqualityRecursvieNode = (parent, node) => { }

    visitComparisonRecursiveNode = (parent, node) => { }

    visitTermNode = (parent, node) => {
        const termRecursiveNode = node.children[0]

    }

    visitTermRecursiveNode = (parent, node) => { }

    visitFactorNode = (parent, node) => { }

    visitFactorRecursviNode = (parent, node) => { }

    visitUnaryNode = (parent, node) => { }

    visitUnaryRecursiveNode = (parent, node) => { }

    visitPrimaryNode = (parent, node) => { }
}```

Then we add a method named "accept(visitor)" for each node created by RecursiveDescentParser, and in the accept method, the node call the conressponding method in the visitor, for example the unary
node will call visitUnaryNode method for the vistor, therefore we change code in RecursiveDescentParser like following:
```
 addAcceptForNode = (parent, node) => {
        switch (node.name) {
            case "root":
                node.accept = (visitor) => {
                    visitor.visitRootNode(parent, node)
                }
                break
            case "statement":
                node.accept = (visitor) => {
                    visitor.visitStatementNode(parent, node)
                }
                break
            case "expression":
                node.accept = (visitor) => {
                    visitor.visitExpressionNode(parent, node)
                }
                break
            case "equality":
                node.accept = (visitor) => {
                    visitor.visitEqualityNode(parent, node)
                }
                break
            case "comparison":
                node.accept = (visitor) => {
                    visitor.visitComparisonNode(parent, node)
                }
                break
            case "equality_recursive":
                node.accept = (visitor) => {
                    visitor.visitEqualityRecursvieNode(parent, node)
                }
                break
            case "comparison_recursive":
                node.accept = (parent, visitor) => {
                    visitor.visitComparisonRecursiveNode(parent, node)
                }
                break
            case "term":
                node.accept = (visitor) => {
                    visitor.visitTermNode(parent, node)
                }
                break
            case "term_recursive":
                //termRecursive node here
                node.accept = (visitor) => {
                    visitor.visitTermRecursiveNode(parent, node)
                }
                break
            case "factor":
                node.accept = (visitor) => {
                    visitor.visitFactorNode(parent, node)
                }
                break
            case "factor_recursive":
                node.accept = (visitor) => {
                    visitor.visitFactorRecursviNode(parent, node)
                }
                break
            case "unary":
                node.accept = (visitor) => {
                    visitor.visitUnaryNode(parent, node)
                }
                break
            case "unary_recursive":
                node.accept = (visitor) => {
                    visitor.visitUnaryRecursiveNode(parent, node)
                }
                break
            case "primary":
                node.accept = (visitor) => {
                    visitor.visitPrimaryNode(parent, node)
                }
                break
        }
    }

    createParseTreeNode = (name) => {
        const node = {
            name: name,
            children: [],
            attributes: "",
        }

        this.addAcceptForNode(node)

        return node
    }
```
We want to change the relation between node and recursive node, such as interchange the parent-child relationship of term and term_recursive, comparison and comparison_recursive, factor and 
factor_recursive, equality and equality_recursive, unary and unary_recursive, we can do this in method of visitEqualityNode, visitComparisonNode, for example when we want to change the relationship
of term and term_recursive, we need to do the following:

1, change the child of comparison from term to term_recursive
2, append the term node as a child of term_recursive
3, remove term_recursive node as the child of term node

and we can change the code of TreeAdjustVisitor like this:
```js
export default class TreeAdjustVisitor {
    constructor() {

    }

    visitChildren = (node) => {
        for (const child of node.children) {
            child.accept(this)
        }
    }

    findNodeInChildren = (node, childName) => {
        for (let i = 0; i < node.children.length; i++) {
            if (node.children[i].name === childName) {
                return i
            }
        }

        return -1
    }

    interChangeParentChild = (parent, child) => {
        //interchange the position of parent and child
        const grandFather = parent.parent
        let idx = this.findNodeInChildren(grandFather, parent.name)
        grandFather.children[idx] = child
        child.children.push(parent)
        //remove child from parent
        idx = this.findNodeInChildren(parent, child.name)
        parent.children.splice(idx, 1)
    }


    visitRootNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitStatementNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitExpressionNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitEqualityNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitComparisonNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitEqualityRecursvieNode = (parent, node) => {
        this.interChangeParentChild(parent, node)

        this.visitChildren(node)
    }

    visitComparisonRecursiveNode = (parent, node) => {
        this.interChangeParentChild(parent, node)

        this.visitChildren(node)
    }

    visitTermNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitTermRecursiveNode = (parent, node) => {
        this.interChangeParentChild(parent, node)

        this.visitChildren(node)
    }

    visitFactorNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitFactorRecursviNode = (parent, node) => {
        this.interChangeParentChild(parent, node)

        this.visitChildren(node)
    }

    visitUnaryNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitUnaryRecursiveNode = (parent, node) => {
        this.interChangeParentChild(parent, node)

        this.visitChildren(node)
    }

    visitPrimaryNode = (parent, node) => {

    }
}
```

we can see from code above, when we visit node like term, equality, factor, comparison, unary, we remember their parent in the field of parent, when we visit node of term_recursive, equlity_recursive,unary_recursive, we call interChangeParentChild to do the three points we mentioned above. Now we can use the TreeAdjustVisitor to change the structure in termal.jsx:
```js
recursiveparsetree: {
            description: 'creating a arithmetic parse tree.',
            usage: "usage recursiveparsetree <string>",
            fn: (...args) => {
                const parser = new RecursiveDescentParser(args.join(' '))
                let res = ''
                try {
                    console.log("run command recursiveparsetree")
                    const root = parser.parse()
                    console.log("parse tree root: ", root)
                    const treeAdjustVisitor = new TreeAdjustVisitor()
                    try {
                        root.accept(treeAdjustVisitor)
                    }
                    catch (e) {
                        console.log(`visitor err: ${e}`)
                    }

                    setParseTree(root)
                    setShowTerminal(false)
                }
                catch (err) {
                    res = err.message
                }
                return res.parseResult
            }
        },
```
After the change we run the command of "recursiveparsetree 1+2;" again and we have to tree like following:
![截屏2024-04-08 16 31 08](https://github.com/wycl16514/draganscript_evaluation/assets/7506958/4098c35f-83fb-4c97-ad60-a51e0a664ab0)

That's exactly what we want here, the position of term and term_recursive interchange successfully.
