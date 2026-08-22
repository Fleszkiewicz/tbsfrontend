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
import { Link } from "react-router-dom";
import { IoAddCircle, IoSearch, IoListCircle } from "react-icons/io5";
import { TripCreateModal } from "../common/TripCreateModal";
import { TripEditModal } from "../common/TripEditModal";

function Home() {
  const { filter, page, setFilter, setMonth, setPage, year, setYear, month } =
    tripsStore();

  const { isOpen, isCreate, setIsCreate, isEdit } = modalStore();
  const { data: trips, isLoading } = useTrips();
  const { tripId } = tripsStore();
  
  const { search, setSearch } = tripsStore();

  const searchHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
  };

  if (isLoading)
    return (
      <div className="h-screen w-full flex justify-center items-center">
        <Spinner text="Cargando" />
      </div>
    );

  return (
    <>
      <div className="relative h-[225px] bg-cover bg-[center_top_0%] bg-[url('https://res.cloudinary.com/dttpgbmdx/image/upload/v1768442834/bg_home_u8jakq.png')]">
        <div className="absolute inset-0 bg-black opacity-30 z-0"></div>

        <div
          className="absolute inset-0 z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0) 66%, rgba(255,255,255,1) 100%)",
          }}
        ></div>
        <div className="relative z-20 h-full flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white drop-shadow-lg text-center mt-10 select-none cursor-default">
            Historial de Reservas
          </h1>
        </div>
      </div>

      <section className="max-w-[900px] mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-4 select-none cursor-default">
          <IoSearch size={30} className="text-gray-400 mr-2" />

          <input
            type="text"
            placeholder="Buscar por legajo o nombre"
            value={search}
            onChange={searchHandleChange}
            className="px-3 py-2 mr-3 rounded border border-gray-300 shadow-sm min-w-[200px] flex-grow"
          />

          <Filter
            filter={filter}
            setFilter={setFilter}
            year={year}
            setYear={setYear}
            month={month}
            setMonth={setMonth}
          />
        </div>

        <TripsTable filteredTrips={trips?.data} />
        <div className="flex justify-between items-center mt-4 select-none ">
          <Pagination page={page} setPage={setPage} />
          <div className="flex gap-2 select-none cursor-default">
            <button
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded shadow select-none "
              onClick={() => setIsCreate(true)}
            >
              <IoAddCircle size={24} />
              Añadir reserva
            </button>

            <Link to="/finance">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#007bff] hover:bg-blue-600 text-white font-semibold rounded shadow select-none ">
                <IoListCircle size={24} />
                Resumen Anual
              </button>
            </Link>
          </div>
        </div>
      </section>

      {isOpen && (
        <Modal>
          <TripModal />
        </Modal>
      )}

      {isEdit && (
        <Modal>
          <TripEditModal key={tripId} />
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
