import { IsString, IsNotEmpty, IsOptional, IsNumber, IsIn, Min, Max } from 'class-validator';

export class CreateRoomDto {
    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    goalId?: string;

    @IsIn(['1v1', 'group', 'free_for_all'])
    type!: string;

    @IsNumber()
    @Min(0)
    entryDeposit!: number;

    @IsIn(['photo', 'link', 'file', 'text', 'any'])
    proofType!: string;

    @IsIn(['1_week', '2_weeks', '1_month', '3_months'])
    duration!: string;

    @IsOptional()
    @IsNumber()
    @Min(2)
    @Max(50)
    maxPlayers?: number;
}
