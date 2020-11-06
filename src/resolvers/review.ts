import {
  Arg,
  Ctx,
  Field,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Individual } from "../entities/Individual";
import { Mentor } from "../entities/Mentor";
import { Review } from "../entities/Review";
import { SessionRequest } from "../entities/SessionRequest";
import { isAuth } from "../middleware/isAuth";
import { isIndividualAuth } from "../middleware/isIndividualAuth";
import { MyContext } from "../types";
import { ReviewInput } from "./inputTypes/ReviewInput";

@ObjectType()
class ReviewResponse {
  @Field(() => String, { nullable: true })
  errorMsg?: string;

  @Field(() => Review, { nullable: true })
  review?: Review;
}

@Resolver()
export class ReviewResolver {
  @Mutation(() => ReviewResponse)
  @UseMiddleware(isIndividualAuth)
  async createReview(
    @Arg("input", () => ReviewInput) input: ReviewInput,
    @Ctx() { req }: MyContext
  ): Promise<ReviewResponse> {
    // Get individual
    const individual = await Individual.findOne({
      where: { user: { id: req.session.userId } },
    });

    if (!individual) {
      return { errorMsg: "User not found" };
    }

    // Get mentor
    const mentor = await Mentor.findOne({
      where: { id: input.mentorId },
    });

    if (!mentor) {
      return { errorMsg: "Mentor not found" };
    }

    // Check if user already reviewd mentor
    const _review = await Review.findOne({ where: { mentor, individual } });

    if (_review) {
      return { errorMsg: "You already left a review." };
    }

    // Get completed sessions between individual and mentor
    const sessions = await SessionRequest.find({
      where: { mentor, individual, status: "complete" },
    });

    if (sessions.length === 0) {
      return { errorMsg: "You have not completed a session with this mentor." };
    }

    const review = new Review();
    review.message = input.message;
    review.rating = input.rating;
    review.mentor = mentor;
    review.individual = individual;

    const createdReview = await Review.save(review);

    return { review: createdReview };
  }

  @Query(() => [Review])
  @UseMiddleware(isAuth)
  async reviewsById(
    @Arg("mentorId", () => Int) mentorId: number
  ): Promise<Review[]> {
    const reviews = await Review.find({
      where: { mentor: { id: mentorId } },
      relations: ["individual", "individual.user"],
    });

    console.log(reviews);
    return reviews;
  }
}
