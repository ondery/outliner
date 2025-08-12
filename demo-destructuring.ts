// Demo TypeScript file to test destructuring parameters
export class TestClass {
  // Basic properties
  public name: string = "test";
  private _id: number = 123;

  // Constructor
  constructor(name: string) {
    this.name = name;
  }

  // Normal methods
  public getName(): string {
    return this.name;
  }

  private validate(): boolean {
    return this.name.length > 0;
  }

  // Async method
  public async saveAsync(): Promise<void> {
    // 🌐⚡ public + async
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Destructuring parameters - BU SORUNU TEST EDİYORUZ
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
    // 🌐⚡ public + async with destructuring parameters
    return { success: true };
  }

  // Complex destructuring
  private async processOrder({
    orderId,
    items,
    customer,
  }: {
    orderId: string;
    items: Array<any>;
    customer: { id: number; name: string };
  }): Promise<void> {
    // 🔒⚡ private + async with complex destructuring
    console.log("Processing order");
  }

  // Multi-line method with normal parameters
  public async fetchUserData(
    userId: number,
    includeProfile: boolean,
    options?: { timeout: number }
  ): Promise<any> {
    // 🌐⚡ public + async with multi-line normal parameters
    return { userId, profile: includeProfile };
  }
}

// Interface for testing
interface PaymentSystem {
  id: number;
  name: string;
}

export { PaymentSystem };
