import Scanner from '../scanner/token'

export default class RecursiveDescentParser {
    constructor(expression) {
        this.source = expression
        this.scanner = new Scanner(expression)
        this.tokens = []
        this.current = -1
        this.parseTree = []
        this.advance()
    }

    getToken = () => {
        return this.tokens[this.current]
    }

    advance = () => {
        if (this.current + 1 >= this.tokens.length) {
            const token = this.scanner.scan()
            if (token.token !== Scanner.EOF) {
                this.tokens.push(token)
                this.current += 1
            }
        }
    }

    previous = () => {
        if (this.current > 0) {
            this.current -= 1
        }
    }

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
                    visitor.visitEqualityRecursiveNode(parent, node)
                }
                break
            case "comparison_recursive":
                node.accept = (visitor) => {
                    visitor.visitComparisonRecursiveNode(parent, node)
                }
                break
            case "term":
                node.accept = (visitor) => {
                    visitor.visitTermNode(parent, node)
                }
                break
            case "term_recursive":
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
                    visitor.visitFactorRecursiveNode(parent, node)
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

    createParseTreeNode = (parent, name) => {
        const node = {
            name: name,
            children: [],
            attributes: "",
        }

        this.addAcceptForNode(parent, node)

        return node
    }

    matchTokens = (tokens) => {
        const curToken = this.getToken()
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === curToken.token) {
                return curToken
            }
        }

        return null
    }

    parse = () => {
        const treeNode = this.createParseTreeNode(null, "root")
        this.statement(treeNode)
        return treeNode
    }

    statement = (parent) => {
        const stmtNode = this.createParseTreeNode(parent, "statement")
        //statement -> exression SEMI
        this.expression(stmtNode)
        const token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("statement miss matching SEMICOLON")
        }
        parent.children.push(stmtNode)
        this.parseTree.push(stmtNode)
    }

    expression = (parentNode) => {
        //expression -> equality
        const exprNode = this.createParseTreeNode(parentNode, "expression")
        this.equality(exprNode)
        parentNode.children.push(exprNode)
    }

    equality = (parentNode) => {
        //equality -> comparison equality_recursive
        const equNode = this.createParseTreeNode(parentNode, "equality")
        this.comparison(equNode)
        this.equalityRecursive(equNode)
        parentNode.children.push(equNode)
    }

    comparison = (parentNode) => {
        //comparison -> term comparison_recursive
        const compaNode = this.createParseTreeNode(parentNode, "comparison")
        this.term(compaNode)
        this.comparisonRecursive(compaNode)
        parentNode.children.push(compaNode)
    }

    equalityRecursive = (parentNode) => {
        const opToken = this.matchTokens([Scanner.BANG_EQUAL, Scanner.EQUAL_EQUAL])
        if (!opToken) {
            //equality_recursive -> epsilon
            return
        }


        //equality_recursive -> (!= | ==) equlity
        const equalityRecursiveNode = this.createParseTreeNode(parentNode, "equality_recursive")
        equalityRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        equalityRecursiveNode.toekn = opToken
        parentNode.children.push(equalityRecursiveNode)
        this.advance()
        this.equality(equalityRecursiveNode)
    }

    comparisonRecursive = (parentNode) => {
        //comparison_recursive -> epsilon | (>|>=|<|<=)comparison
        const opToken = this.matchTokens([Scanner.GREATER_EQUAL, Scanner.GREATER,
        Scanner.LESS, Scanner.LESS_EQUAL])
        if (!opToken) {
            //comparison_recursive -> epsilon
            return
        }
        //comparison_recursive ->  (>|>=|<|<=)comparison
        const comparisonRecursiveNode = this.createParseTreeNode(parentNode, "comparison_recursive")
        comparisonRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        comparisonRecursiveNode.token = opToken
        parentNode.children.push(comparisonRecursiveNode)
        //scan over those operators
        this.advance()
        this.comparison(comparisonRecursiveNode)
    }

    term = (parentNode) => {
        //term -> factor term_recursive
        const term = this.createParseTreeNode(parentNode, "term")
        this.factor(term)
        this.termRecursive(term)
        parentNode.children.push(term)
    }

    termRecursive = (parentNode) => {
        //term_recursive -> epsilon | ("-" | "+") term
        const opToken = this.matchTokens([Scanner.MINUS, Scanner.PLUS])
        if (opToken === null) {
            //term_recursive -> epsilon
            return
        }
        //term_recursive ->   ("-" | "+") term
        const termRecursiveNode = this.createParseTreeNode(parentNode, "term_recursive")
        termRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        termRecursiveNode.token = opToken
        parentNode.children.push(termRecursiveNode)
        this.advance()
        this.term(termRecursiveNode)
    }

    factor = (parentNode) => {
        //factor -> unary factor_recursive
        const factor = this.createParseTreeNode(parentNode, "factor")
        this.unary(factor)
        this.factorRecursive(factor)
        parentNode.children.push(factor)
    }

    factorRecursive = (parentNode) => {
        //factor_recursive -> epsilon | ("*" | "/") factor
        const opToken = this.matchTokens([Scanner.START, Scanner.SLASH])
        if (opToken === null) {
            //factor_recursive -> epsilon
            return
        }

        //factor_recursive ->   ("*" | "/") factor
        const factorRecursiveNode = this.createParseTreeNode(parentNode, "factor_recursive")
        factorRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        factorRecursiveNode.token = opToken
        parentNode.children.push(factorRecursiveNode)
        this.advance()
        this.factor(factorRecursiveNode)
    }

    unary = (parentNode) => {
        //unary -> primary | unary_recursive
        const unaryNode = this.createParseTreeNode(parentNode, "unary")
        if (this.primary(unaryNode) === false) {
            this.unaryRecursive(unaryNode)
        }
        parentNode.children.push(unaryNode)
    }

    unaryRecursive = (parentNode) => {
        //unary_recursive -> epsilon | ("!" | "-") unary
        const opToken = this.matchTokens([Scanner.BANG, Scanner.MINUS])
        if (opToken === null) {
            //unary_recursive -> epsilon
            return
        }

        //unary_recursive -> ("!" | "-") unary
        const unaryRecursiveNode = this.createParseTreeNode(parentNode, "unary_recursive")
        unaryRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        unaryRecursiveNode.token = opToken
        this.advance()
        parentNode.children.push(unaryRecursiveNode)
        this.unary(unaryRecursiveNode)
    }


    primary = (parentNode) => {
        //primary -> NUMBER | STRING | true | false | nil | "(" expression ")"|epsilon
        const token = this.matchTokens([Scanner.NUMBER, Scanner.STRING,
        Scanner.TRUE, Scanner.FALSE, Scanner.NIL, Scanner.LEFT_PAREN])
        if (token === null) {
            //primary -> epsilon
            return false
        }

        const primaryNode = this.createParseTreeNode(parentNode, "primary")
        if (token.lexeme === '(') {
            primaryNode.attributes = {
                value: "grouping",
            }
        } else {
            primaryNode.attributes = {
                value: token.lexeme,
            }
            primaryNode.token = token
        }

        parentNode.children.push(primaryNode)

        this.advance()
        if (token.token === Scanner.LEFT_PAREN) {
            //primary -> ( expression )
            this.expression(primaryNode)
            if (!this.matchTokens([Scanner.RIGHT_PAREN])) {
                throw new Error("Missing match ) in expression")
            }
            this.advance()
        }
        return true
    }

}