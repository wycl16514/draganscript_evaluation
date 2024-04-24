import RecursiveDescentParser from "../parser/recursive_descent_parser";
import Intepreter from "./intepreter";
import TreeAdjustVisitor from "./tree_adjust_visitor";

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

    it("should evaluate float number successfully", () => {
        const root = createParsingTree("12.34;")
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 12.34,
        })
    })

    it("should evaluate string literal successfully", () => {
        const root = createParsingTree('"hello world!";')
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })

    it("should evaluate string or number literal in parentheses", () => {
        let root = createParsingTree('(1.23);')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })

        root = createParsingTree('("hello world!");')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })

    it("should evaluate unary operator - for number literal", () => {
        let root = createParsingTree('-1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: -1.23,
        })
    })

    it("should evaluate unary operator ! for true and false boolean", () => {
        let root = createParsingTree('!true;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!false;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate to false for unary operator ! for expression not nil and false", () => {
        let root = createParsingTree('!1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!"hello";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!nil;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate binary operator +, - correctly", () => {
        let root = createParsingTree('1.23+2.46;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 3.69,
        })

        root = createParsingTree('2.46-1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })
    })


    it("should evaluate binary operator * and / correctly", () => {
        let root = createParsingTree('1.23*2;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 2.46,
        })

        root = createParsingTree('2.46 / 2;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })
    })

    it("should evaluate comparison operator correctly", () => {
        let root = createParsingTree('2.46 > 1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('1.23 >= 2.46;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('2.46 < 1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('1.23 <= 2.46;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate equality operator correctly", () => {
        let root = createParsingTree('2.46 == 1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('2.46 != 1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('nil == nil;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('"hello" == "hello";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('"hello" != "world";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should support number and string for operator + and *", () => {
        let root = createParsingTree('3 + "hello,world!";')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "3hello,world!",
        })

        root = createParsingTree('"hello,world!" + 3;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,world!3",
        })

        root = createParsingTree('3 * "hello,";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,hello,hello,",
        })

        root = createParsingTree('"hello," * 3;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,hello,hello,",
        })
    })

    it("should report error for incompatible type operation", () => {
        let root = createParsingTree('"hello" - "world!";')
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

        root = createParsingTree('"hello" / "world!";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" * "world!";')
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

        root = createParsingTree('"hello" <=  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >=  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >=  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <=  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()
    })

})