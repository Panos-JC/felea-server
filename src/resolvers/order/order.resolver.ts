import {
  Arg,
  Ctx,
  Int,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { getRepository } from "typeorm";
import { Individual } from "../../entities/Individual";
import { Order } from "../../entities/Order";
import { Product } from "../../entities/Product";
import { isIndividualAuth } from "../../middleware/isIndividualAuth";
import { MyContext } from "../../types";

@Resolver()
export class OrderResolver {
  private orderRepository = getRepository(Order);
  private productRepository = getRepository(Product);
  private individualRepository = getRepository(Individual);

  @Mutation(() => Order)
  @UseMiddleware(isIndividualAuth)
  async createOrder(
    @Arg("productId", () => Int) productId: number,
    @Ctx() { req }: MyContext
  ): Promise<Order> {
    const individual = await this.individualRepository.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      throw new Error("User not found");
    }

    const product = await this.productRepository.findOne(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const order = new Order();

    order.individual = individual;
    order.product = product;

    try {
      const newOrder = await this.orderRepository.save(order);
      return newOrder;
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
  }

  @Query(() => [Order])
  async orders(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      relations: ["product", "individual", "individual.user"],
      order: {
        createdAt: "DESC",
      },
    });

    return orders;
  }

  @Query(() => Order)
  async order(@Arg("orderId", () => Int) orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ["product", "individual", "individual.user"],
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  @Mutation(() => Order)
  async setStatus(
    @Arg("orderId", () => Int) orderId: number,
    @Arg("status", () => String) status: string
  ): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId);

    if (!order) {
      throw new Error("Order not found");
    }

    order.status = status;

    try {
      const newOrder = await this.orderRepository.save(order);
      return newOrder;
    } catch (error) {
      console.log(error);
      throw new Error("Something went wrong");
    }
  }
}
