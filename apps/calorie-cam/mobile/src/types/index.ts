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
}

export interface FoodLog {
  id: string;
  user_id?: string;
  image_url: string;
  food_name: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
  logged_at: string;
}
