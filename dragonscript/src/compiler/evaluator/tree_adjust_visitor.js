import RecursiveDescentParser from "../parser/recursive_descent_parser"

export default class TreeAdjustVisitor {
    constructor() {
        this.parser = new RecursiveDescentParser("")
    }

    visitChildren = (node) => {
        for (const child of node.children) {
            child.accept(this)
        }
    }

    findNodeInChildren = (parent, child) => {
        for (let i = 0; i < parent.children.length; i++) {
            if (parent.children[i] === child) {
                return i
            }
        }

        return -1
    }

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


    visitRootNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitStatementNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitProgramNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitStatementRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitPrintStatementNode = (parent, node) => {
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
        this.visitChildren(node)

        this.interChangeParentChild(parent, node)
    }

    visitComparisonRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.interChangeParentChild(parent, node)
    }

    visitTermNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitTermRecursiveNode = (parent, node) => {
        this.visitChildren(node)

        this.interChangeParentChild(parent, node)
    }

    visitFactorNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitFactorRecursviNode = (parent, node) => {
        this.visitChildren(node)

        this.interChangeParentChild(parent, node)
    }

    visitUnaryNode = (parent, node) => {
        node.parent = parent
        this.visitChildren(node)
    }

    visitUnaryRecursiveNode = (parent, node) => {
        //we don't need to adjust the tree for unary operation
        // this.interChangeParentChild(parent, node)
        // this.visitChildren(node)
        node.parent = parent
        this.visitChildren(node)
    }

    visitPrimaryNode = (parent, node) => {

    }
}
