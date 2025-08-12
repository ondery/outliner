// Test TypeScript file to demonstrate the TS OUTLINER extension
//
// 🎨 EMOJI AYARLARI:
// settings.json dosyanıza ekleyin:
// {
//   "tsOutlineEnhancer.emojiSettings": {
//     "public": "🟢",
//     "private": "🔴",
//     "method": "⚙️",
//     "class": "📦"
//   }
// }
//
// Hızlı ayar için:
// Ctrl+Shift+P -> "TS Outliner: Open Emoji Settings"
//
export interface ITestInterface {
  interfaceMethod(): void;
  interfaceProperty: string;
}

export abstract class AbstractBase {
  abstract abstractMethod(): void;

  protected protectedBaseMethod(): void {
    console.log("Protected base method");
  }
}

export class TestClass extends AbstractBase implements ITestInterface {
  // Public property
  public publicProperty: string = "public";

  // Private property
  private privateProperty: number = 42;

  // Protected property
  protected protectedProperty: boolean = true;

  // Readonly property
  readonly readonlyProperty: string = "readonly";

  // Static property
  static staticProperty: string = "static";

  // Constructor
  constructor(name: string) {
    super();
    this.publicProperty = name;
  }

  // Public method
  public publicMethod(): void {
    console.log("This is a public method");
  }

  // Private method
  private privateMethod(): void {
    console.log("This is a private method");
  }

  // Protected method
  protected protectedMethod(): void {
    console.log("This is a protected method");
  }

  // Static method
  static staticMethod(): void {
    console.log("This is a static method");
  }

  // Async method
  async asyncMethod(): Promise<void> {
    console.log("This is an async method");
  }

  // Private async method
  private async privateAsyncMethod(): Promise<string> {
    return "Private async result";
  }

  // Getter
  get getValue(): string {
    return this.publicProperty;
  }

  // Setter
  set setValue(value: string) {
    this.publicProperty = value;
  }

  // Abstract method implementation
  abstractMethod(): void {
    console.log("Abstract method implementation");
  }

  // Interface method implementation
  interfaceMethod(): void {
    console.log("Interface method implementation");
  }

  // Interface property implementation
  interfaceProperty: string = "interface property";
}

// Top-level functions and exports

// Export function declaration
export function topLevelFunction(): void {
  console.log("Top level function");
}

// Export async function declaration
export async function topLevelAsyncFunction(): Promise<void> {
  console.log("Top level async function");
}

// Export default function
export function defaultFunction(): void {
  console.log("Default function");
}

// Export default async function (React layout örneği)
export default async function RootLayout(params: any) {
  const { locale } = await params;
  console.log("Root layout with locale:", locale);
  return "HTML content";
}

// Export arrow function (const)
export const exportedArrowFunction = (): void => {
  console.log("Exported arrow function");
};

// Export async arrow function (const)
export const exportedAsyncArrowFunction = async (): Promise<void> => {
  console.log("Exported async arrow function");
};

// Arrow function (private - not exported)
const arrowFunction = (): void => {
  console.log("Arrow function");
};

// Private top-level function (not exported)
function privateTopLevelFunction(): void {
  console.log("Private top level function");
}

// Utility functions export
export const utilityFunction = (value: string) => {
  return value.toUpperCase();
};

// Named export with complex parameters
export function complexParamFunction(
  config: { name: string; age: number },
  callback: (result: string) => void
): void {
  callback(`Hello ${config.name}, age: ${config.age}`);
}
