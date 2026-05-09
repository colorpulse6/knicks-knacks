export interface FoodAnalysisResult {
  success: boolean;
  data: {
    foodName: string;
    calories?: number;
    proteins?: number;
    fats?: number;
    carbs?: number;
    isFood: boolean;
    message?: string;
  };
  imageUrl: string;
  log?: FoodLog;
}

export interface FoodLog {
  id: string;
  user_id?: string;
  image_url: string;
  image_path?: string | null;
  food_name: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  logged_at: string;
}

export interface FoodLogUpdateInput {
  foodName?: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
}
