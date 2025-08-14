export class TestClass {
  private name: string;
  public age: number;

  constructor(name: string, age: number, private readonly id: string) {
    this.name = name;
    this.age = age;
    console.log(`Creating instance with id: ${this.id}`);
    this.initialize();
  }

  private initialize(): void {
    console.log("Initializing...");
  }

  public getName(): string {
    return this.name;
  }

  public setName(newName: string): void {
    this.name = newName;
  }

  protected calculateAge(): number {
    return new Date().getFullYear() - this.age;
  }

  async fetchData(): Promise<string> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("Data fetched");
      }, 1000);
    });
  }
}

// Sizin örneğinize benzer constructor
export class CartClass {
  private id: string;
  private changeToken: string;
  private userId: number;
  private invoiceAccountId: number;
  private discountCouponId: number;
  private processStatus: any;
  private isInProgress: boolean;
  private itemsBrutTotal: number;
  private installmentCount: number;
  private installmentDiffAmount: number;
  private installmentDiffTax: number;
  private singleInstallmentAmount: number;
  private createdAt: Date;
  private updatedAt: Date;
  private dbData: any;
  private cartMembershipPlanManager: any;
  private cartProductManager: any;
  private paymentManager: any;
  private discountManager: any;
  private taxManager: any;
  private DiscountCoupon: any;
  private systemSetting: any;
  private invoiceService: any;

  constructor(data: any & { user: any }) {
    this.id = data.id;
    this.changeToken = data.changeToken;
    this.userId = data.userId;
    this.invoiceAccountId = data.invoiceAccountId;
    this.discountCouponId = data.discountCouponId;

    // Çok satırlı atamalar
    this.processStatus = data.processStatus;
    this.isInProgress = data.isInProgress;
    this.itemsBrutTotal = data.itemsBrutTotal;
    this.installmentCount = data.installmentCount;
    this.installmentDiffAmount = data.installmentDiffAmount;
    this.installmentDiffTax = data.installmentDiffTax;
    this.singleInstallmentAmount = data.singleInstallmentAmount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;

    // Manager'ların başlatılması
    this.dbData = new Date(); // Mock object
    this.cartMembershipPlanManager = {};
    this.cartProductManager = {};
    this.paymentManager = {};
    this.discountManager = {};
    this.taxManager = {};

    // Son atamalar
    this.DiscountCoupon = data.DiscountCoupon;
    this.systemSetting = {};
    this.invoiceService = null;
  }
}

export interface TestInterface {
  id: string;
  process(): void;
}

// Problematik fonksiyon - inline object type
export function problematicFunction(data: {
  id: number;
  name: string;
  config: { enabled: boolean };
}): string {
  console.log("Processing data:", data);
  if (data.config.enabled) {
    return `Hello ${data.name} with id ${data.id}`;
  }
  return "Disabled";
}

// Başka bir problematik örnek
export function anotherProblem(
  user: { id: number; name: string },
  settings: { theme: string; lang: string }
): any {
  console.log("User:", user);
  console.log("Settings:", settings);

  const result = {
    userId: user.id,
    config: settings,
  };

  return result;
}

export function globalFunction(): string {
  return "Global function";
}
