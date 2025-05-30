
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { DentistsList } from "@/components/Dentists/DentistsList";

const Dentists = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Dentistas</h1>
              <p className="text-gray-600 mt-2">Gerencie os dentistas da clínica</p>
            </div>
            <DentistsList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dentists;
