"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestClass = void 0;
// Test TypeScript file to demonstrate the outline enhancer
class TestClass {
    // Public property
    publicProperty = "public";
    // Private property  
    privateProperty = 42;
    // Protected property
    protectedProperty = true;
    // Readonly property
    readonlyProperty = "readonly";
    // Static property
    static staticProperty = "static";
    constructor(name) {
        this.publicProperty = name;
    }
    // Public method
    publicMethod() {
        console.log("This is a public method");
    }
    // Private method
    privateMethod() {
        console.log("This is a private method");
    }
    // Protected method
    protectedMethod() {
        console.log("This is a protected method");
    }
    // Static method
    static staticMethod() {
        console.log("This is a static method");
    }
    // Getter
    get getValue() {
        return this.publicProperty;
    }
    // Setter
    set setValue(value) {
        this.publicProperty = value;
    }
}
exports.TestClass = TestClass;
//# sourceMappingURL=test-file.js.map