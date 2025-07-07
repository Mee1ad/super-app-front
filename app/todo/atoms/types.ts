export type ListType = "task" | "shopping";
export type Variant = "default" | "outlined" | "filled";

export interface ListResponse {
  id: string;
  type: ListType;
  title: string;
  variant: Variant;
  created_at: string;
  updated_at: string;
}

export interface ListCreate {
  type: ListType;
  title: string;
  variant: Variant;
}

export interface ListUpdate {
  title?: string | null;
  variant?: Variant | null;
}

export interface TaskResponse {
  id: string;
  list_id: string;
  title: string;
  description: string | null;
  checked: boolean;
  variant: Variant;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string | null;
  checked: boolean;
  variant: Variant;
  position: number;
}

export interface TaskUpdate {
  list_id?: string;
  title?: string | null;
  description?: string | null;
  checked?: boolean | null;
  variant?: Variant | null;
  position?: number | null;
}

export interface ShoppingItemResponse {
  id: string;
  list_id: string;
  title: string;
  url: string | null;
  price: string | null;
  source: string | null;
  checked: boolean;
  variant: Variant;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ShoppingItemCreate {
  title: string;
  url?: string | null;
  price?: string | null;
  source?: string | null;
  checked: boolean;
  variant: Variant;
  position: number;
}

export interface ShoppingItemUpdate {
  list_id?: string;
  title?: string | null;
  url?: string | null;
  price?: string | null;
  source?: string | null;
  checked?: boolean | null;
  variant?: Variant | null;
  position?: number | null;
}

export interface ReorderRequest {
  item_ids: string[];
}

export interface SearchResponse {
  lists: ListResponse[];
  tasks: TaskResponse[];
  shopping_items: ShoppingItemResponse[];
}

export interface ListWithItems extends ListResponse {
  tasks?: TaskResponse[];
  items?: ShoppingItemResponse[];
} 