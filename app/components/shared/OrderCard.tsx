"use client";

import { useState } from "react";
import Order from "@/types/Order";
import { cancelOrder } from "@/lib/actions/order.actions"

const statusConfig = {
  CONFIRMED: { label: "Confirmed", colors: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", colors: "bg-red-100 text-red-800" },
};

export default function OrderCard({ order }: { order: Order }) {
 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const currentStatus = statusConfig[order.status]

 
  const handleCancelClick = (e: React.MouseEvent) => {
    e.stopPropagation();  
    setIsCancelModalOpen(true);
  };

 
  const confirmCancellation = async () => { 
    await cancelOrder(order.id!)
    setIsCancelModalOpen(false);
    setIsModalOpen(false);
  };

  return (
    <>
 
      <div 
        onClick={() => setIsModalOpen(true)}
        className="w-full block border border-gray-100 rounded-lg p-5 hover:border-[#0071c2] hover:bg-blue-50/30 hover:shadow-md transition-all duration-200 group cursor-pointer"
      >
        <div className="flex flex-wrap justify-between gap-4">
          
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${currentStatus.colors}`}>
                {currentStatus.label}
              </span>
              
              <span className="text-sm text-black">
                Booked on: {new Date(order.orderDate).toLocaleDateString('en-US')}
              </span>
            </div>
            
            <p className="text-base text-black mt-3 font-semibold group-hover:text-[#0071c2] transition-colors">
              Check-in: {new Date(order.checkInDate).toLocaleDateString('en-US')} — Check-out: {new Date(order.checkOutDate).toLocaleDateString('en-US')}
            </p>
            
            <p className="text-sm text-black mt-1">
              Guests: {order.numberOfPeople}
            </p>
          </div>
          
          <div className="text-left md:text-right border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 flex flex-col items-start md:items-end justify-between">
            <div>
              <p className="text-sm text-black">Total:</p>
              <p className="text-xl font-extrabold text-[#0071c2]">
                UAH {order.price.toLocaleString('en-US')}
              </p>
            </div>
            
 
            <div className="flex items-center gap-4 mt-3">
             
              <span className="text-sm text-[#0071c2] font-medium group-hover:underline">
                Details →
              </span>
              {order.status !== 'CANCELLED' && (
                <button 
                  onClick={handleCancelClick}
                  className="px-3 py-1 text-xs font-medium text-red-600 bg-white border border-red-200 rounded hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  Cancel Booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

 
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-black hover:text-gray-800 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            <h3 className="text-2xl font-bold text-black mb-6 border-b pb-4">Booking Details</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-black">Status</span>
                <span className={`px-3 py-1 text-xs text-black font-semibold rounded-full ${currentStatus.colors}`}>
                  {currentStatus.label}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-black">Order ID</span>
                <span className="font-mono text-sm text-black">{order.id}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-black">Booked on</span>
                <span className="font-medium text-black">{new Date(order.orderDate).toLocaleDateString('en-US')}</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg my-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-black">Check-in</span>
                  <span className="font-bold text-black">{new Date(order.checkInDate).toLocaleDateString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Check-out</span>
                  <span className="font-bold text-black">{new Date(order.checkOutDate).toLocaleDateString('en-US')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black">Guests</span>
                  <span className="font-medium text-black">{order.numberOfPeople}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t text-lg">
                <span className="text-black font-bold">Total Price</span>
                <span className="font-extrabold text-[#0071c2]">UAH {order.price.toLocaleString('en-US')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

 
      {isCancelModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
         
          onClick={(e) => { e.stopPropagation(); setIsCancelModalOpen(false); }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsCancelModalOpen(false)}
              className="absolute top-4 right-4 text-black hover:text-gray-800 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
            >
              ×
            </button>

            <h3 className="text-xl font-bold text-red-600 mb-4 border-b border-gray-100 pb-4">
              Cancel Booking?
            </h3>
            
            <p className="text-black mb-6">
              Are you sure you want to cancel your stay from <span className="font-bold">{new Date(order.checkInDate).toLocaleDateString('en-US')}</span> to <span className="font-bold">{new Date(order.checkOutDate).toLocaleDateString('en-US')}</span>? 
              <br /><br />
              This action cannot be undone.
            </p>

            <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                No, keep it
              </button>
              <button 
                onClick={confirmCancellation}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}