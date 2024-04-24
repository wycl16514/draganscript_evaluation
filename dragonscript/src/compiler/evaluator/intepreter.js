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

    visitEqualityRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)

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

    visitComparisonRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)

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

    visitTermNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

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

    visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)

        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes
        this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)

        let type = "number"
        switch (node.attributes.value) {
            case "+":
                if (leftRes.type === "number" && rightRes.type === "string") {
                    type = "string"
                    leftRes.value = leftRes.value.toString()
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

    visitFactorNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitFactorRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        const leftRes = node.children[0].evalRes
        const rightRes = node.children[1].evalRes

        this.typeIncompatibleError(leftRes, rightRes, node.attributes.value)

        let type = "number"
        switch (node.attributes.value) {
            case "*":
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
                } else {
                    node.evalRes = {
                        type: type,
                        value: leftRes.value * rightRes.value
                    }
                }

                break
            case "/":
                node.evalRes = {
                    type: type,
                    value: leftRes.value / rightRes.value
                }
                break
            default:
                throw new Error(`unknown operator for factor_recursive: ${node.attributes.value}`)
        }

        this.attachEvalResult(parent, node)
    }

    visitUnaryNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitUnaryRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        if (node.attributes.value === "-") {
            node.evalRes.value = -node.evalRes.value
        }
        if (node.attributes.value === "!") {
            if (node.evalRes.type === "NIL") {
                node.evalRes = {
                    type: "boolean",
                    value: true,
                }
            }
            else if (node.evalRes.type === "boolean") {
                if (node.evalRes.value === false) {
                    node.evalRes.value = true
                } else {
                    node.evalRes.value = false
                }
            } else {
                node.evalRes = {
                    type: "boolean",
                    value: false,
                }
            }
        }
        this.attachEvalResult(parent, node)
    }

    visitPrimaryNode = (parent, node) => {
        /*
        if the primary node is grouping, then we need to evaluae its child(expression)
        */
        if (node.attributes.value === "grouping") {
            this.visitChildren(node)
            this.attachEvalResult(parent, node)
            return
        }

        const token = node.token
        let type = undefined
        let value = undefined
        switch (token.token) {
            case Scanner.NUMBER:
                type = "number"
                if (token.lexeme.indexOf(".") === -1) {
                    value = parseInt(token.lexeme)
                } else {
                    value = parseFloat(token.lexeme)
                }
                break
            case Scanner.STRING:
                type = "string"
                value = token.lexeme
                break
            case Scanner.TRUE:
                type = "boolean"
                value = true
                break
            case Scanner.FALSE:
                type = "boolean"
                value = false
                break
            case Scanner.NIL:
                type = "NIL"
                value = null
                break
        }

        parent.evalRes = {
            type: type,
            value: value,
        }
    }
}