import { useTrips } from "../../hooks/useTrips";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";

type Props = {
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
};

export const Pagination = ({ page, setPage }: Props) => {
  const { data: trips } = useTrips();
  const totalPages = trips?.pagination?.totalPages ?? 1;

  if (totalPages <= 0) return null;

  return (
    <div className="flex justify-between items-center w-full mt-4 select-none px-2">
      <span className="text-[13px] font-medium text-gray-500">
        Página {totalPages === 0 ? 0 : page} de {totalPages}
      </span>

      <div className="flex items-center gap-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max((p as number) - 1, 1))}
          className="text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-default"
        >
          <IoChevronBack size={18} />
        </button>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => (p as number) + 1)}
          className="text-gray-400 hover:text-black disabled:opacity-30 disabled:hover:text-gray-400 transition-colors cursor-pointer disabled:cursor-default"
        >
          <IoChevronForward size={18} />
        </button>
      </div>
    </div>
  );
};
