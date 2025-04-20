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
