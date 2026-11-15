export type Category =
  | 'Automotive'
  | 'Beauty'
  | 'Books'
  | 'Electronics'
  | 'Fashion'
  | 'Grocery'
  | 'Health & Personal Care'
  | 'Home & Kitchen'
  | 'Office Supplies'
  | 'Pet Supplies'
  | 'Sports & Fitness'
  | 'Toys';

export type ActivityStatus = 'Active' | 'At Risk' | 'Dormant' | 'Inactive';

export type BehaviorSegment =
  | 'Frequent Buyer'
  | 'New Buyer'
  | 'Occasional Buyer'
  | 'Regular Buyer';

export interface Profile {
  customer_id: string;
  cluster: number;
  activity_status: ActivityStatus;
  behavior_segment: BehaviorSegment;
}

export interface ProfilesArtifact {
  kind: 'profiles';
  items: Profile[];
}

export interface ClusterRanking {
  cluster: number;
  categories: Category[];
}

export interface RankingsArtifact {
  kind: 'rankings';
  clusters: ClusterRanking[];
}

export interface PopularityArtifact {
  kind: 'popularity';
  categories: Category[];
}

export interface Artifacts {
  profiles: ProfilesArtifact;
  rankings: RankingsArtifact;
  popularity: PopularityArtifact;
}

export type LayoutVariant =
  | 'OFERTAS_PRIMERO'
  | 'RECOMPRA_PRIMERO'
  | 'EXPLORACION'
  | 'DEFAULT_POPULAR';

export type HeroEmphasis =
  | 'discounts'
  | 'previousPurchases'
  | 'bestSellers'
  | 'globalBestSellers';

export type SectionKind = 'offers' | 'suggestions' | 'keepShopping' | 'categories';

export interface Layout {
  variant: LayoutVariant;
  heroEmphasis: HeroEmphasis;
  sections: SectionKind[];
  isPersonalized: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  discount: number;
  emoji: string;
  bestSeller?: boolean;
  previouslyBought?: boolean;
}
