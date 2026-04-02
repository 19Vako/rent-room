import AdminHeader from "../components/admin/AdminHeader";
import DashboardCalendar from "../components/admin/DashboardCalendar";

export default function Home() {
  return (
    <main 
      className="min-h-screen relative bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('/photo-1554995207-c18c203602cb.avif')" 
      }}
     >
      <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-0 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col ">
      
          <AdminHeader/>
          <DashboardCalendar/>

        </div>
 
    </main>
  );
}