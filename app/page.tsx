import SearchWidget from "./components/shared/SearchWidget";
import Header from "./components/shared/Header";
import RoomList from "./components/shared/RoomList"; 
import PriceFilter from "./components/shared/PriceFilter";

export default function Home() {
  return (
   <main className="min-h-screen bg-gray-50">
      <Header />
      
      
      <section className="relative pt-24 pb-32 px-4 flex flex-col items-center justify-center bg-[#003580]" >
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6">
          <div>
            <h1 className="text-white text-4xl md:text-5xl font-bold mb-2">
              Find your perfect stay
            </h1>
            <p className="text-white text-xl md:text-2xl">
              Rent apartments or rooms in just a few clicks.
            </p>
          </div>

          <div className="mt-4">
            <SearchWidget />
        </div>
        </div>
      </section>
      
      
      <section className="w-full max-w-7xl mx-auto flex flex-wrap items-start gap-8 px-4 py-12 pb-24">

        
        <aside className="w-full lg:w-[320px] shrink-0">
          <div className="lg:sticky lg:top-28 space-y-6">
            <PriceFilter />
          </div>
        </aside>
 
        <div className="flex-1 w-full min-w-0">
          <RoomList />
        </div>

      </section>

    </main>
  );
}