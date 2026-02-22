import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

const CATEGORIES = ['fitness', 'learning', 'career', 'business', 'finance', 'content_creation'] as const;
const GOAL_TYPES = ['habit', 'project', 'skill', 'challenge'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;
const TIMELINES = ['1_week', '2_weeks', '1_month', '3_months'] as const;

export class CreateGoalDto {
    @IsIn(CATEGORIES)
    category!: string;

    @IsString()
    @IsNotEmpty()
    title!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsIn(GOAL_TYPES)
    goalType!: string;

    @IsIn(DIFFICULTIES)
    difficulty!: string;

    @IsIn(TIMELINES)
    timeline!: string;
}
