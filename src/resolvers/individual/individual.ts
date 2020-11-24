import {
  Arg,
  Ctx,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Individual } from "../../entities/Individual";
import { Users } from "../../entities/Users";
import { isIndividualAuth } from "../../middleware/isIndividualAuth";
import { stripe } from "../../stripe";
import { MyContext } from "../../types";

@Resolver()
export class IndividualResolver {
  @Query(() => [Individual])
  async individuals(): Promise<Individual[]> {
    const individuals = await Individual.find({ relations: ["user"] });

    console.log(individuals);
    return individuals;
  }

  @Mutation(() => Individual)
  @UseMiddleware(isIndividualAuth)
  async createSubscription(
    @Arg("token", () => String) token: string,
    @Ctx() { req }: MyContext
  ) {
    const user = await Users.findOne(req.session.userId);

    if (!user) {
      throw new Error("User not found");
    }

    const individual = await Individual.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      throw new Error("Individual not found");
    }

    const customer = await stripe.customers.create({
      email: user.email,
      source: token,
    });

    console.log("customer ", customer);

    // try {
    //   const test = await stripe.paymentMethods.attach(pm, {
    //     customer: customer.id,
    //   });
    //   console.log("test ", test);
    // } catch (error) {
    //   throw new Error("paymentMethods.attach Error");
    // }

    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: "price_1Hhw3UGUOvv7bpMIFR2ZczuN" }],
    });

    individual.stripeCustomerId = customer.id;
    individual.subscriptionId = subscription.id;
    individual.premium = true;
    await individual.save();

    console.log(subscription);
    console.log(individual);

    return individual;
  }
}
