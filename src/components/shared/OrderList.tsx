import Order from "@/src/types/Order";
import OrderCard from "./OrderCard";

export default function OrderList({ orders }: { orders: Order[] }) {
  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}
