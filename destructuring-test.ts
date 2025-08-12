// Demo TypeScript file to test destructuring parameter methods
export class PaymentService {
  // Basic methods
  public getName(): string {
    return "Payment Service";
  }

  private validate(): boolean {
    return true;
  }

  // Standard async method
  public async processPayment(amount: number): Promise<any> {
    // 🌐⚡ public async
    return { success: true, amount };
  }

  // DESTRUCTURING PARAMETER METHODS - These should be detected as methods
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
    // 🌐⚡ public async with destructuring parameters
    return {
      paymentSystem,
      paymentAmount,
      paymentStatus,
      paymentDate,
    };
  }

  private async processOrder({
    orderId,
    items,
  }: {
    orderId: string;
    items: any[];
  }): Promise<void> {
    // 🔒⚡ private async with destructuring
    console.log("Processing order", orderId, items);
  }

  protected updateConfig({
    timeout,
    retries,
  }: {
    timeout: number;
    retries: number;
  }): void {
    // 🛡️ protected with destructuring
    console.log("Config updated", { timeout, retries });
  }

  static async createPayment({
    userId,
    amount,
  }: {
    userId: string;
    amount: number;
  }): Promise<PaymentService> {
    // 🌐📌⚡ public static async with destructuring
    const service = new PaymentService();
    return service;
  }

  // Regular parameters for comparison
  public regularMethod(param1: string, param2: number): void {
    console.log("Regular method", param1, param2);
  }
}

// Interface
export interface IPaymentConfig {
  timeout: number;
  retries: number;
}

// Top-level function with destructuring
export async function processTransaction({
  transactionId,
  amount,
}: {
  transactionId: string;
  amount: number;
}): Promise<any> {
  return { transactionId, amount, processed: true };
}
