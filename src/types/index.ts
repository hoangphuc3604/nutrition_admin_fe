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
  description: string;
  imageUrl?: string;
  calories: number;
  prepTime: number;
  cookTime: number;
  servings: number;
  tags: string[];
  ingredients: RecipeIngredient[];
  createdAt: string;
}

export interface RecipeIngredient {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: string;
  caloriesPerUnit: number;
  createdAt: string;
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
