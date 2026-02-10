import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateDepositDto {
  @IsNumber()
  @Min(1, { message: 'Minimum deposit is $1' })
  @Max(100000, { message: 'Maximum deposit is $100,000' })
  amount: number;

  @IsString()
  @IsOptional()
  gateway?: string;
}
