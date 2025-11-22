import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCarDTO {
  @IsString()
  @IsUUID()
  readonly id: string;
  // @IsString({message:"THe brand most be a cool string"})
  @IsString()
  @IsOptional()
  readonly brand: string;
  @IsString()
  @IsOptional()
  readonly model: string;
}
