import Header from "../components/shared/Header";
import { getUserOrders } from "@/lib/actions/order.actions";
import { auth } from "@/auth";
import OrderList from "../components/shared/OrderList";
import BackButton from "../components/shared/BackButton";
 



export default async function ProfilePage() {
  const session = await auth();
  const response = await getUserOrders();
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="bg-[#003580] pt-24 pb-20 px-4 md:px-10">
        <div className="max-w-6xl mx-auto flex items-center gap-6">
          <div className="w-16 h-16 bg-[#3563a9] text-white flex items-center justify-center rounded-full text-3xl font-bold border-4 border-white shadow-xl">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-white text-3xl md:text-4xl font-bold">
              Hello, {userName}!
            </h1>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-10 -mt-10">
        <div className="max-w-6xl mx-auto bg-white p-6 md:p-10 rounded-lg shadow-xl min-h-[400px]">
          <BackButton />
          <h2 className="text-2xl mt-8 font-bold text-gray-900 mb-8">Your Bookings</h2>
          {!response.success || !response.orders ? (
            <div className="p-10 text-center text-red-600 bg-red-50 rounded-lg border border-red-200">
              Error: {response.error || "Failed to load your bookings."}
            </div>
          ) : response.orders.length === 0 ? (
            <div className="text-center text-gray-500 py-16 flex flex-col items-center gap-4">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              You don't have any bookings yet. Time to plan your next trip!
            </div>
            
          ) : (
            <OrderList orders={response.orders} />
          )}
        </div>
      </section>
    </main>
  );
}