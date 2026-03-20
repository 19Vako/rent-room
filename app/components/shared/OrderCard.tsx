import Link from "next/link";
import Order from "@/types/Order";

const statusConfig = {
  CONFIRMED: { label: "Confirmed", colors: "bg-green-100 text-green-800" },
  PENDING: { label: "Pending", colors: "bg-yellow-100 text-yellow-800" },
  CANCELLED: { label: "Cancelled", colors: "bg-red-100 text-red-800" },
};


export default function OrderCard({ order }: { order: Order & { _id?: string }}) {
  // Получаем нужные цвета и текст для статуса
  const currentStatus = statusConfig[order.status] || statusConfig.PENDING;

  // Формируем ссылку на страницу комнаты. 
  // Используем toString(), так как roomId может быть объектом ObjectId из MongoDB
  const roomIdStr = order.roomId?.toString();
  const href = roomIdStr ? `/room/${roomIdStr}` : "#";

  return (
    // Заменили <div> на <Link>, чтобы вся карточка была кликабельной
    <Link 
      href={href}
      className="block border border-gray-100 rounded-lg p-5 hover:border-[#0071c2] hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.colors}`}>
              {currentStatus.label}
            </span>
            
            <span className="text-sm text-gray-400">
              Booked on: {new Date(order.orderDate).toLocaleDateString('en-US')}
            </span>
          </div>
          
          <p className="text-base text-gray-900 mt-3 font-semibold group-hover:text-[#0071c2] transition-colors">
            Check-in: {new Date(order.checkInDate).toLocaleDateString('en-US')} — Check-out: {new Date(order.checkOutDate).toLocaleDateString('en-US')}
          </p>
          
          <p className="text-sm text-gray-600 mt-1">
            Guests: {order.numberOfPeople}
          </p>
        </div>
        
        {/* Правая часть: Цена и кнопка-ссылка */}
        <div className="text-left md:text-right border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
          <p className="text-sm text-gray-500">Total:</p>
          <p className="text-xl font-extrabold text-[#0071c2]">
            UAH {order.price.toLocaleString('en-US')}
          </p>
          {/* Имитация кнопки: так как вся карточка это Link, <button> тут не нужен, используем span */}
          <span className="inline-block mt-3 text-sm text-[#0071c2] font-medium group-hover:underline">
            Details →
          </span>
        </div>

      </div>
    </Link>
  );
}