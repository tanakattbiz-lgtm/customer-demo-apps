import {
  ShoppingBag,
  Package,
  Factory,
  Boxes,
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  Briefcase,
  type LucideProps,
} from "lucide-react";
import type { Category } from "../data/seed";

const MAP: Record<Category, React.ComponentType<LucideProps>> = {
  "販売・接客": ShoppingBag,
  "物流・倉庫": Package,
  "製造・工場": Factory,
  軽作業: Boxes,
  "飲食・フード": UtensilsCrossed,
  "介護・福祉": HeartHandshake,
  ドライバー: Truck,
  "事務・オフィス": Briefcase,
};

export function CategoryIcon({
  category,
  ...props
}: { category: Category } & LucideProps) {
  const Icon = MAP[category] ?? Briefcase;
  return <Icon {...props} />;
}
