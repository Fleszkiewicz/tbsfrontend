import { useState } from "react";
import { useTrips } from "../hooks/useTrips";
import { modalStore } from "../store/modalStore";
import { tripsStore } from "../store/tripsStore";
import { Filter } from "../common/Filter";
import { Spinner } from "../common/widget/Spinner";
import { Modal } from "../layout/Modal";
import { TripModal } from "../common/TripModal";
import { Pagination } from "../common/Pagination";
import { TripsTable } from "../common/TripsTable";
import { TripCreateModal } from "../common/TripCreateModal";
import { TripEditModal } from "../common/TripEditModal";
import { IoAdd, IoSearch, IoReloadOutline } from "react-icons/io5";



function Home() {
  const { filter, page, setFilter, setMonth, setPage, year, setYear, month, resetFilters } =
    tripsStore();

  const { isOpen, isCreate, setIsCreate, isEdit } = modalStore();
  const { data: trips, isLoading } = useTrips();
  const [searchTerm, setSearchTerm] = useState<string>("");

  const searchHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };




  const filteredTrips = trips?.data.filter(
    (item) =>
      item.id.toString().includes(searchTerm) ||
      item.apellido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading)
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Spinner text="Cargando" />
      </div>
    );

  return (
    <>
      <div className="max-w-[1200px] mx-auto mt-28 mb-4 px-4">
        <h1 className="text-[35px] font-semibold text-black select-none cursor-default mb-8">
          Historial de Reservas
        </h1>

        <div className="flex items-center gap-4 mb-8 select-none flex-wrap">
          <button
            className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white flex-shrink-0 hover:bg-gray-800 transition-colors shadow-[0_4px_10px_rgba(0,0,0,0.15)]"
            onClick={() => setIsCreate(true)}
          >
            <IoAdd size={26} />
          </button>

          <div className="relative w-[280px] group flex-shrink-0">
            <IoSearch size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por legajo o nombre"
              value={searchTerm}
              onChange={searchHandleChange}
              className="w-full pl-[38px] pr-4 py-2.5 bg-[#e8e8e8] rounded-full border border-transparent focus:ring-1 focus:ring-gray-400 focus:outline-none transition-all text-[14px] font-medium text-[#1D1D1F] placeholder:text-gray-500"
            />
          </div>
          {/* 
          <div className="flex items-center justify-center w-8 text-gray-500 hover:text-black cursor-pointer transition-colors">
            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="20" width="20" xmlns="http://www.w3.org/2000/svg"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>
          </div> */}

          <div className="flex-grow"></div>

          <div className="flex items-center gap-2 text-xs">
            {/* Botón de Reset a la izquierda de los filtros */}
            <button
              className="text-gray-400 font-medium hover:text-black hover:rotate-180 transition-all duration-300 mr-2 p-1 rounded-full hover:bg-gray-100"
              onClick={() => {
                resetFilters();
                setSearchTerm("");
              }}
              title="Deshacer todos los filtros"
            >
              <IoReloadOutline size={20} />
            </button>
            <Filter
              year={year}
              setYear={setYear}
              month={month}
              setMonth={setMonth}
              filter={filter}
              setFilter={setFilter}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className="mb-2">
          <TripsTable filteredTrips={filteredTrips} />
        </div>

        {/* Paginación */}
        <Pagination page={page} setPage={setPage} />
      </div>

      {isOpen && (
        <Modal>
          <TripModal />
        </Modal>
      )}

      {isEdit && (
        <Modal>
          <TripEditModal />
        </Modal>
      )}
      {isCreate && (
        <Modal>
          <TripCreateModal />
        </Modal>
      )}
    </>
  );
}

export default Home;
