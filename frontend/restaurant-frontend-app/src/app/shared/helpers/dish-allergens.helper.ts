import { DishListResponse } from '@app/models/dishes/dish-list-response.model';

export interface DishAllergenInfo {
  allergens: string[];
  isSpicy: boolean;
  removableAllergens: string[];
  canBeNonSpicy: boolean;
}

export const DISH_ALLERGEN_METADATA: Record<string, DishAllergenInfo> = {
  'dish-avocado-bowl': {
    allergens: ['nuts'],
    isSpicy: false,
    removableAllergens: ['nuts'],
    canBeNonSpicy: false,
  },
  'dish-strawberry-salad': {
    allergens: ['nuts'],
    isSpicy: false,
    removableAllergens: ['nuts'],
    canBeNonSpicy: false,
  },
  'dish-sweet-potato-salad': {
    allergens: ['nuts'],
    isSpicy: false,
    removableAllergens: ['nuts'],
    canBeNonSpicy: false,
  },
  'dish-spring-salad': {
    allergens: ['cilantro'],
    isSpicy: false,
    removableAllergens: ['cilantro'],
    canBeNonSpicy: false,
  },
  'dish-eggplant-rolls': {
    allergens: ['nuts', 'cilantro'],
    isSpicy: false,
    removableAllergens: ['cilantro'], // Walnut filling is paste/baked inside; cilantro garnish is removable
    canBeNonSpicy: false,
  },
  'dish-mushroom-khinkali': {
    allergens: ['cilantro'],
    isSpicy: true,
    removableAllergens: ['cilantro'],
    canBeNonSpicy: true,
  },
  'dish-lobio-pot': {
    allergens: ['cilantro'],
    isSpicy: true,
    removableAllergens: ['cilantro'],
    canBeNonSpicy: true,
  },
  'dish-berry-chia': {
    allergens: ['nuts'], // Almond milk base
    isSpicy: false,
    removableAllergens: [], // Base cannot be removed
    canBeNonSpicy: false,
  },
  'dish-pelamushi-tart': {
    allergens: ['nuts'], // Almond crust & walnut topping
    isSpicy: false,
    removableAllergens: [], // Almond crust baked in
    canBeNonSpicy: false,
  },
  'dish-pkhali-trio': {
    allergens: ['nuts', 'cilantro'],
    isSpicy: false,
    removableAllergens: [], // Nuts blended into vegetable pâté
    canBeNonSpicy: false,
  },
  'dish-honey-walnut-baklava': {
    allergens: ['nuts'],
    isSpicy: false,
    removableAllergens: [], // Baked in phyllo layers - cannot be removed!
    canBeNonSpicy: false,
  },
  'dish-saperavi-wine': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-rkatsiteli-wine': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-kindzmarauli-wine': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
};

export function enrichDishWithAllergens(dish: DishListResponse): DishListResponse {
  if (!dish) return dish;
  const meta = DISH_ALLERGEN_METADATA[dish.id];

  const allergens = dish.allergens !== undefined ? dish.allergens : (meta?.allergens ?? []);
  const isSpicy = dish.isSpicy !== undefined ? dish.isSpicy : (meta?.isSpicy ?? false);
  const removableAllergens =
    dish.removableAllergens !== undefined ? dish.removableAllergens : (meta?.removableAllergens ?? []);
  const canBeNonSpicy =
    dish.canBeNonSpicy !== undefined ? dish.canBeNonSpicy : (meta?.canBeNonSpicy ?? false);

  return {
    ...dish,
    allergens,
    isSpicy,
    removableAllergens,
    canBeNonSpicy,
  };
}

export function getAllergenRemovalLabel(allergen: string): string {
  if (allergen.toLowerCase() === 'nuts') {
    return 'No nuts';
  }
  if (allergen.toLowerCase() === 'cilantro') {
    return 'No cilantro';
  }
  return `No ${allergen}`;
}

export function getAllergenDisplayName(allergen: string): string {
  if (allergen.toLowerCase() === 'nuts') {
    return 'Nuts';
  }
  if (allergen.toLowerCase() === 'cilantro') {
    return 'Cilantro';
  }
  return allergen;
}
