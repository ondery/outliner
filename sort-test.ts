// Test dosyası - Sort özelliklerini test etmek için

export interface User {
  id: number;
  name: string;
}

export class Cart {
  private items: string[] = [];
  public total: number = 0;
  protected discount: number = 0;

  constructor() {
    console.log("Cart created");
  }

  public addItem(item: string): void {
    this.items.push(item);
  }

  private calculateTotal(): number {
    return this.items.length * 10;
  }

  public get itemCount(): number {
    return this.items.length;
  }

  public set totalAmount(value: number) {
    this.total = value;
  }

  protected applyDiscount(): void {
    this.total -= this.discount;
  }
}

export function helperFunction(): string {
  return "helper";
}

export function anotherHelper(): void {
  console.log("another");
}

export class Product {
  public id: number = 0;
  private _name: string = "";

  constructor(id: number, name: string) {
    this.id = id;
    this._name = name;
  }

  public getName(): string {
    return this._name;
  }
}

export interface ProductInfo {
  category: string;
  price: number;
}
