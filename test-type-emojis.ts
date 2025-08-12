// Demo TypeScript file to test type-based emoji icons
export class TestClass {
  // Properties - should show 📝 + visibility emoji
  public name: string = "test"; // 📝🌐 property + public
  private _id: number = 123; // 📝🔒 property + private
  protected level: number = 1; // 📝🛡️ property + protected

  // Combined modifiers
  static readonly count: number = 0; // 📝🌐📌📖 property + public + static + readonly
  private static instances: TestClass[]; // 📝🔒📌 property + private + static

  // Constructor - should show 🏗️ + visibility
  constructor(name: string) {
    // 🏗️🌐 constructor + public
    this.name = name;
  }

  // Methods - should show ⚙️ + visibility + modifiers
  public getName(): string {
    // ⚙️🌐 method + public
    return this.name;
  }

  private validate(): boolean {
    // ⚙️🔒 method + private
    return this.name.length > 0;
  }

  protected initialize(): void {
    // ⚙️🛡️ method + protected
    this.level = 1;
  }

  // Async method
  public async saveAsync(): Promise<void> {
    // ⚙️🌐⚡ method + public + async
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Getters and Setters - should show 📤/📥 + visibility
  get displayName(): string {
    // 📤🌐 getter + public
    return `User: ${this.name}`;
  }

  set displayName(value: string) {
    // 📥🌐 setter + public
    this.name = value.replace("User: ", "");
  }

  private get secretValue(): string {
    // 📤🔒 getter + private
    return this._id.toString();
  }

  private set secretValue(value: string) {
    // 📥🔒 setter + private
    this._id = parseInt(value);
  }

  // Static getter/setter
  static get instanceCount(): number {
    // 📤🌐📌 getter + public + static
    return TestClass.instances?.length || 0;
  }

  // Destructuring parameters method (testing the original issue)
  async addPayment({
    paymentSystem,
    paymentAmount,
    paymentStatus,
    paymentDate,
  }: {
    paymentSystem: string;
    paymentAmount: number;
    paymentStatus: string;
    paymentDate: Date;
  }): Promise<any> {
    // ⚙️🌐⚡ method + public + async
    return { success: true };
  }
}

// Abstract class - should show 📦 + modifiers
export abstract class AbstractService {
  // 📦🌐🎭 class + public + abstract
  abstract processData(data: any): Promise<any>; // ⚙️🌐🎭⚡ method + public + abstract + async

  protected abstract validate(input: any): boolean; // ⚙️🛡️🎭 method + protected + abstract
}

// Interface - should show 📋
export interface IUserService {
  // 📋🌐 interface + public
  getUserAsync(id: number): Promise<any>; // ⚙️🌐⚡ method + public + async
  updateUser(user: any): void; // ⚙️🌐 method + public
}

// Top-level functions - should show 🔧
export function utilityFunction(): void {
  // 🔧🌐 function + public
  console.log("Utility");
}

export async function fetchUserAsync(id: number): Promise<any> {
  // 🔧🌐⚡ function + public + async
  return { id };
}

const privateHelper = () => {
  // 🔧🔒 function + private
  return "helper";
};
