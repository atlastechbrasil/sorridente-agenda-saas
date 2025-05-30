
import { Header } from "@/components/Layout/Header";
import { Sidebar } from "@/components/Layout/Sidebar";
import { PatientsList } from "@/components/Patients/PatientsList";

const Patients = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
              <p className="text-gray-600 mt-2">Gerencie os pacientes da clínica</p>
            </div>
            <PatientsList />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Patients;
