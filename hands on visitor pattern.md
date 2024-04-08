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
