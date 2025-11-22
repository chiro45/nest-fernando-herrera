import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDTO } from './dtos/create-car.dto';
import { UpdateCarDTO } from './dtos/update-car.dto';

@Controller('cars')
export class CarsController {
  constructor(private readonly carservice: CarsService) {}

  @Get()
  getAllCars() {
    return this.carservice.findAll();
  }

  @Get(':id')
  getCarById(@Param('id', ParseUUIDPipe) id: string) {
    return this.carservice.findById(id);
  }

  @Post()
  createCar(@Body() createCarDto: CreateCarDTO) {
    return this.carservice.createCar(createCarDto);
  }

  @Patch(':id')
  updateCar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCarDto: UpdateCarDTO,
  ) {
    return this.carservice.updateCar(id, updateCarDto);
  }

  @Delete(':id')
  deleteCar(@Param('id', ParseUUIDPipe) id: string) {
    return this.carservice.deleteCar(id);
  }
}
