import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { paginationDto } from 'src/common/dtos/pagination.dto';
import { validate } from 'uuid';

@Injectable()
// 👆 Le dice a Nest que esta clase puede ser inyectada como dependencia
export class ProductsService {
  // Logger propio del servicio (para logs en consola / archivo)
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Nest inyecta automáticamente el repositorio de Product
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  // ==========================
  // CREAR PRODUCTO
  // ==========================
  async create(createProductDto: CreateProductDto) {
    try {
      // Crea una instancia de Product a partir del DTO
      const product = this.productRepository.create(createProductDto);

      // Guarda el producto en la base de datos
      await this.productRepository.save(product);

      // Devuelve el producto ya persistido
      return product;
    } catch (error) {
      // Manejo centralizado de errores de base de datos
      this.handleDBExceptions(error);
    }
  }

  // TODO: Paginar resultados
  // ==========================
  // OBTENER TODOS LOS PRODUCTOS
  // ==========================
  async findAll(paginationDto: paginationDto) {
    try {
      const { limit = 0, offset = 0 } = paginationDto;
      // Busca todos los productos en la base de datos
      return await this.productRepository.find({
        take: limit,
        skip: offset,
        //TODO:Relaciones
      });
    } catch (error) {
      // Si ocurre un error, se maneja de forma centralizada
      this.handleDBExceptions(error);
    }
  }

  // ==========================
  // OBTENER UN PRODUCTO POR ID
  // ==========================
  async findOne(term: string) {
    let product: Product | null;

    if (validate(term)) {
      // Busca un producto por su id
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      //busca termino por slug
      //product = await this.productRepository.findOneBy({ slug: term });
      //usar querybuilder
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .getOne();
    }

    // Si no existe, lanza un error 404
    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }

    // Si existe, lo devuelve
    return product;
  }

  // ==========================
  // ACTUALIZAR PRODUCTO (PENDIENTE)
  // ==========================
  async update(id: string, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.preload({
        id: id,
        ...updateProductDto,
      });
      if (!product)
        throw new NotFoundException(`Product with id: ${id} not found`);

      try {
        await this.productRepository.save(product);
        return product;
      } catch (error) {
        // Si ocurre un error, se maneja de forma centralizada
        this.handleDBExceptions(error);
      }
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // ==========================
  // ELIMINAR PRODUCTO
  // ==========================
  async remove(id: string) {
    // 👉 this hace referencia a la instancia actual de ProductsService
    // Es decir: este mismo objeto/clase.

    // Llamamos al método findOne del MISMO servicio
    // Es equivalente a hacer:
    // productsService.findOne(id)
    const product = await this.findOne(id);

    // Si findOne no encuentra el producto, ya lanzó un NotFoundException
    // Por lo tanto, si llegamos acá, el producto existe.

    // Eliminamos el producto de la base de datos
    await this.productRepository.remove(product);
  }

  // ==========================
  // MANEJO CENTRALIZADO DE ERRORES
  // ==========================
  private handleDBExceptions(error: any) {
    // Código de error de PostgreSQL para valores duplicados (unique constraint)
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    // Loguea el error completo en consola
    this.logger.error(error);

    // Error genérico si no se reconoce el tipo
    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}
