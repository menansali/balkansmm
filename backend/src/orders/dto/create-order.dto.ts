import { IsInt, Min, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateOrderDto {
    @IsInt()
    serviceId: number;

    @IsString()
    link: string;

    @IsInt()
    @Min(1)
    quantity: number;

    @IsOptional()
    @IsBoolean()
    dripFeed?: boolean;

    @IsOptional()
    @IsInt()
    runs?: number;

    @IsOptional()
    @IsInt()
    interval?: number;
}
