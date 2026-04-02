"use client";

import { useState, useEffect } from "react";
import OrderList from "../shared/OrderList";
import { useSettingData } from "@/store/useSettingData";
import { getRoomOrders } from "@/lib/actions/order.actions"; 
import Order from "@/types/Order";

export default function OrdersModalButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const { selectedRoom } = useSettingData()

  useEffect(() => {
    if (isOpen && selectedRoom?.id) {
      const fetchOrders = async () => {
        setLoading(true);
        const res = await getRoomOrders(selectedRoom?.id as string);
        if (res.success && res.orders) {
          setOrders(res.orders);
        } else {
          setOrders([]);
        }
        setLoading(false);
      };
      
      fetchOrders();
    }
  }, [isOpen, selectedRoom?.id]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 text-white text-lg font-semibold rounded hover:bg-blue-800 transition shadow-sm"
      >
        Orders
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          
 
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col relative overflow-hidden">
            
 
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Orders list</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-800 text-3xl leading-none transition"
              >
                &times;
              </button>
            </div>

 
            <div className="p-5 overflow-y-auto flex-1 bg-gray-50 text-black">
              {!selectedRoom?.id ? (
                <div className="text-center text-gray-500 py-10">
                  Please select a room to view its bookings.
                </div>
              ) : loading ? (
                <div className="text-center py-10 text-gray-600 flex flex-col items-center gap-3">
 
                  <div className="w-8 h-8 border-4 border-[#003580] border-t-transparent rounded-full animate-spin"></div>
                  Loading orders...
                </div>
              ) : orders.length > 0 ? (
                <OrderList orders={orders} />
              ) : (
                <div className="text-center py-10 text-gray-500">
                  For this room there are no orders yet.
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}