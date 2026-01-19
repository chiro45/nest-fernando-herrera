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
import { DataSource, Repository } from 'typeorm';

import { Product } from './entities/product.entity';
import { validate } from 'uuid';
import { paginationDto } from '../common/dtos/pagination.dto';
import { ProductImage } from './entities/peoduct-image.entity';

@Injectable()
// 👆 Le dice a Nest que esta clase puede ser inyectada como dependencia
export class ProductsService {
  // Logger propio del servicio (para logs en consola / archivo)
  private readonly logger = new Logger('ProductsService');

  constructor(
    // Nest inyecta automáticamente el repositorio de Product
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  // ==========================
  // CREAR PRODUCTO
  // ==========================
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;
      // Crea una instancia de Product a partir del DTO
      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });

      // Guarda el producto en la base de datos
      await this.productRepository.save(product);

      // Devuelve el producto ya persistido
      return { ...product, images };
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
      const { limit = 10, offset = 0 } = paginationDto;
      // Busca todos los productos en la base de datos
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        },
      });
      return products.map(({ images, ...rest }) => ({
        ...rest,
        images: images?.map((image) => image.url),
      }));
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
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug =:slug', {
          title: term.toUpperCase(),
          slug: term.toLocaleLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    // Si no existe, lanza un error 404
    if (!product) {
      throw new NotFoundException(`Product with id ${term} not found`);
    }

    // Si existe, lo devuelve
    return product;
  }

  async findOnePlain(term: string) {
    const { images, ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images?.map((el) => el.url),
    };
  }

  // ==========================
  // ACTUALIZAR PRODUCTO (PENDIENTE)
  // ==========================
  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;

    try {
      const product = await this.productRepository.preload({
        id,
        ...toUpdate,
      });

      if (!product)
        throw new NotFoundException(`Product with id: ${id} not found`);

      //create query runner
      const queryRunner = this.dataSource.createQueryRunner();
      //se conecta a la bd
      await queryRunner.connect();
      //inicia la transaccion
      await queryRunner.startTransaction();

      try {
        //borramos las imagenes anteriores
        if (images) {
          //id del producto
          await queryRunner.manager.delete(ProductImage, { product: { id } });
          //asignamos las imagenes
          product.images = images?.map((el) =>
            this.productImageRepository.create({ url: el }),
          );
          await queryRunner.manager.save(product);
        }
        //its all okey the transaction is sucessfull
        await queryRunner.commitTransaction();
        //kill the query runner
        await queryRunner.release();
        return this.findOnePlain(id);
      } catch (error) {
        // Si ocurre un error, se maneja de forma centralizada
        //rollback's trasaction
        await queryRunner.rollbackTransaction();
        //kill the query runner
        await queryRunner.release();
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
    const product = await this.findOne(id);

    await this.productRepository.remove(product);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
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
