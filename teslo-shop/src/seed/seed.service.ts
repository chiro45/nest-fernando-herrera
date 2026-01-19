import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/data';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class SeedService {
  constructor(private readonly productService: ProductsService) {}

  async runSeed() {
    this.inserNewProducts();
    return;
  }

  private async inserNewProducts() {
    this.productService.deleteAllProducts();
    const seedProducts = initialData.products;
    const inserPromises: Promise<any>[] = [];
    seedProducts.forEach((el) => {
      inserPromises.push(this.productService.create(el));
    });

    await Promise.all(inserPromises);
    return true;
  }
}
