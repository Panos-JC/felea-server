import { Arg, Mutation, Query, Resolver, UseMiddleware } from "type-graphql";
import { getRepository } from "typeorm";
import { Product } from "../../entities/Product";
import { isAdminAuth } from "../../middleware/isAdminAuth";
import { isAuth } from "../../middleware/isAuth";
import cloudinary from "../../utils/cloudinary";
import { ProductInput } from "./product.input";
import { CreateProductResponse } from "./product.response";

@Resolver()
export class ProductResolver {
  private productRepository = getRepository(Product);

  @Query(() => [Product])
  @UseMiddleware(isAuth)
  async products(): Promise<Product[]> {
    const products = await this.productRepository.find({});

    return products;
  }

  @Mutation(() => CreateProductResponse)
  @UseMiddleware(isAdminAuth)
  async createProduct(
    @Arg("input", () => ProductInput) input: ProductInput
  ): Promise<CreateProductResponse> {
    if (!input.descriptionRichText || !input.description) {
      return { error: { field: "description", message: "Field required" } };
    }

    if (!input.image) {
      return { error: { field: "image", message: "You must upload a photo" } };
    }

    const product = new Product();

    product.title = input.title;
    product.subtitle = input.subtitle;
    product.descriptionRichText = input.descriptionRichText;
    product.description = input.description;
    product.price = input.price;

    try {
      const result = await cloudinary.uploader.upload(input.image, {
        width: 600,
        height: 600,
        crop: "fill",
      });

      product.image = result.secure_url;
      product.imagePublicId = result.public_id;

      await this.productRepository.save(product);

      return { product };
    } catch (error) {
      console.log(error);
      return { error: { field: "general", message: "Something went wrong" } };
    }
  }
}
