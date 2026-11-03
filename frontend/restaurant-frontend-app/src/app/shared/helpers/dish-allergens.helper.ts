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
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-sweet-potato-salad': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-spring-salad': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-eggplant-rolls': {
    allergens: ['nuts', 'cilantro'],
    isSpicy: false,
    removableAllergens: ['cilantro'], // Walnut filling is inside; cilantro garnish is removable
    canBeNonSpicy: false,
  },
  'dish-mushroom-khinkali': {
    allergens: ['cilantro'],
    isSpicy: true,
    removableAllergens: ['cilantro'],
    canBeNonSpicy: true,
  },
  'dish-lobio-pot': {
    allergens: [],
    isSpicy: true,
    removableAllergens: [],
    canBeNonSpicy: true,
  },
  'dish-berry-chia': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-pelamushi-tart': {
    allergens: [],
    isSpicy: false,
    removableAllergens: [],
    canBeNonSpicy: false,
  },
  'dish-pkhali-trio': {
    allergens: ['nuts'],
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

  let meta = DISH_ALLERGEN_METADATA[dish.id];

  if (!meta && dish.name) {
    const nameLower = dish.name.toLowerCase();
    for (const [idKey, val] of Object.entries(DISH_ALLERGEN_METADATA)) {
      const simplifiedKey = idKey.replace('dish-', '').replace(/-/g, ' ');
      if (nameLower.includes(simplifiedKey)) {
        meta = val;
        break;
      }
    }
  }

  const allergens =
    Array.isArray(dish.allergens) && dish.allergens.length > 0
      ? dish.allergens
      : (meta ? meta.allergens : (Array.isArray(dish.allergens) ? dish.allergens : []));

  const isSpicy =
    typeof dish.isSpicy === 'boolean'
      ? dish.isSpicy
      : (meta?.isSpicy ?? false);

  const removableAllergens =
    Array.isArray(dish.removableAllergens) && dish.removableAllergens.length > 0
      ? dish.removableAllergens
      : (meta ? meta.removableAllergens : (Array.isArray(dish.removableAllergens) ? dish.removableAllergens : []));

  const canBeNonSpicy =
    typeof dish.canBeNonSpicy === 'boolean'
      ? dish.canBeNonSpicy
      : (meta?.canBeNonSpicy ?? false);

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
