import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { Brand } from './entities/brand.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class BrandsService {
  private brands: Brand[] = [];

  create(createBrandDto: CreateBrandDto) {
    const newBrand: Brand = {
      id: uuid(),
      name: createBrandDto.name,
      createdAt: new Date().getTime(),
    };
    this.brands.push(newBrand);

    return newBrand;
  }

  findAll() {
    return this.brands;
  }

  findOne(id: string) {
    const search = this.brands.find((brands) => brands.id === id);
    if (!search) throw new NotFoundException(`Brand with id ${id} not found`);

    return search;
  }

  update(id: string, updateBrandDto: UpdateBrandDto) {
    let result = this.brands.find((el) => el.id === id);
    if (!result) throw new NotFoundException(`Brand with id ${id} not found`);
    const updatedBrand = {
      ...result,
      ...updateBrandDto,
      id,
    };
    this.brands = this.brands.map((el) => {
      if (el.id === id) {
        return updatedBrand;
      }
      return el;
    });

    return updatedBrand;
  }

  remove(id: string) {
    let result = this.brands.find((el) => el.id === id);
    if (!result) throw new NotFoundException(`Brand with id ${id} not found`);

    this.brands = this.brands.filter((el) => el.id !== id);

    return;
  }
   fillBrandsWithSeedData(seedCars: Brand[]) {
      this.brands = seedCars;
    }
}
