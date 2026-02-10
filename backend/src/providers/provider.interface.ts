export interface SmmProvider {
  getServices(): Promise<any[]>;
  createOrder(
    serviceId: string | number,
    link: string,
    quantity: number,
  ): Promise<any>;
  getOrderStatus(orderId: string | number): Promise<any>;
  refill(orderId: string | number): Promise<any>;
}
