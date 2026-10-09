import { IoPieChartOutline } from "react-icons/io5";

const Dashboard = () => {
  return (
    <div className="max-w-[900px] mx-auto px-4 pt-24 md:pt-28 pb-16 animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-[29px] md:text-[32px] lg:text-[35px] font-semibold text-[#1D1D1F] tracking-tight select-none cursor-default">
          Estadísticas
        </h1>
        <p className="text-gray-500 mt-2 text-[13px] md:text-[15px]">
          Visualiza el rendimiento y los datos generales de la agencia.
        </p>
      </div>

      <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <IoPieChartOutline size={32} className="text-gray-400" />
        </div>
        <h2 className="text-[16px] md:text-[18px] font-semibold text-[#1D1D1F] mb-2">Sección en construcción</h2>
        <p className="text-gray-500 text-center text-[13px] md:text-[14px] max-w-md">
          Próximamente podrás ver aquí gráficos de ventas, destinos más populares y balance financiero.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
