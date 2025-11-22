import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Icar } from './interfaces/car.interface';
import { v4 as uuid, v4 } from 'uuid';
import { CreateCarDTO } from './dtos/create-car.dto';

@Injectable()
export class CarsService {
  private cars: Icar[] = []

  findAll() {
    return this.cars;
  }

  findById(id: string) {
    const search = this.cars.find((car) => car.id === id);
    if (!search) throw new BadRequestException(`Car with id ${id} not found`);

    return search;
  }

  createCar(newCar: CreateCarDTO) {
    //if(!this.cars.some(el=> el.brand ===  newCar.model)){
    const car: Icar = {
      id: v4(),
      ...newCar,
    };
    this.cars.push(car);
    //}else{

    //}

    return newCar;
  }
  updateCar(id: string, updatedCarDto: CreateCarDTO) {
    let result = this.cars.find((el) => el.id === id);
    if (!result) throw new NotFoundException(`Car with id ${id} not found`);
    const updatedCar = {
      ...result,
      ...updatedCarDto,
      id,
    };
    this.cars = this.cars.map((el) => {
      if (el.id === id) {
        return updatedCar;
      }
      return el;
    });

    return updatedCar;
  }
  deleteCar(id: string) {
    let result = this.cars.find((el) => el.id === id);
    if (!result) throw new NotFoundException(`Car with id ${id} not found`);

    this.cars = this.cars.filter((el) => el.id !== id);

    return;
  }

  fillCarsWithSeedData(seedCars: Icar[]) {
    this.cars = seedCars;
  }
}
