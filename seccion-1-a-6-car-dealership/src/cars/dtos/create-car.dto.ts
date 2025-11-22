import { IsString } from 'class-validator';

export class CreateCarDTO {
  // @IsString({message:"THe brand most be a cool string"})
  @IsString()
  readonly brand: string;
  @IsString()
  readonly model: string;
}
