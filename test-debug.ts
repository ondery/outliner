class TestClass {
  private name: string;

  constructor() {
    this.name = "test";
  }

  public getName(): string {
    return this.name;
  }

  private setName(newName: string): void {
    this.name = newName;
  }
}

interface TestInterface {
  prop: string;
  method(): void;
}

function testFunction() {
  console.log("test");
}
