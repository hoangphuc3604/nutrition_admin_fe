import { UserRole } from '@/enum/role.enum';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'banned';
  createdAt: string;
  mealPlansCount: number;
}

export interface Recipe {
  id: string;
  name: string;
  description?: string; // Changed from required to optional to match backend nullable
  image_url?: string;
  cuisine_type?: string;
  difficulty_level?: "easy" | "medium" | "hard";
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  servings?: number;
  instructions?: string;
  created_by: string; // Changed from optional to required to match backend
  createdAt: string; // Keep as string for frontend (backend returns Date but JSON serializes to string)
  updatedAt: string; // Keep as string for frontend (backend returns Date but JSON serializes to string)
  is_active: boolean; // Changed from optional to required to match backend
  is_public: boolean; // Changed from optional to required to match backend
  ai_generated: boolean; // Changed from optional to required to match backend
  recipeIngredients?: RecipeIngredient[];
}

export interface RecipeIngredient {
  recipe_id: string;
  ingredient_id: string;
  ingredient?: Ingredient;
  quantity: number;
  unit: string;
  preparation_method?: string;
  is_optional?: boolean;
  sort_order?: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category?: any;
  description?: string;
  image_url?: string;
  shelf_life_days?: number;
  storage_temperature?: "frozen" | "refrigerated" | "room_temp";
  common_unit?: string;
  caloriesPerUnit?: number;
  createdAt?: string;
  updatedAt?: string;
  is_active?: boolean;
}

export interface DashboardStats {
  totalUsers: number;
  totalMealPlans: number;
  totalRecipes: number;
  totalIngredients: number;
  surveyCompletionRate: number;
  userGrowth: number;
  mealPlanGrowth: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
}
