import type { ReactNode } from "react";
import { modalStore } from "../store/modalStore";
import { tripsStore } from "../store/tripsStore";

export const Modal = ({ children }: { children: ReactNode }) => {
  const { setIsOpen, setIsEdit, setIsCreate } = modalStore();
  const { setTripId } = tripsStore();
  const handleBackgroundClick = () => {
    setTripId(null);
    setIsOpen(false);
    setIsCreate(false);
    setIsEdit(false);
  };
  return (
    <section
      className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4"
      onClick={handleBackgroundClick}
    >
      <div
        className="bg-opacity-50 flex items-center justify-center p-4 w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </section>
  );
};
