import Order from "@/types/Order";
import OrderCard from "./OrderCard";  


export default function OrderList({ orders }: {
  orders: (Order & { _id?: string })[];
}) {
  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <OrderCard key={order._id} order={order} />
      ))}
    </div>
  );
}