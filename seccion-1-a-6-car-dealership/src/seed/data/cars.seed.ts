import { Icar } from '../../cars/interfaces/car.interface';
import { v4 as uuid } from 'uuid';
export const CARS_SEED: Icar[] = [
  {
    id: uuid(),
    brand: 'Ford',
    model: 'raptor',
  },
  {
    id: uuid(),
    brand: 'Honda',
    model: 'Civic',
  },
  {
    id: uuid(),
    brand: 'Toyota ',
    model: 'Corolla',
  },
];
