import type { MouseEventHandler } from "react";
import { IoClose } from "react-icons/io5";

type Props = {
  onCLick: MouseEventHandler<HTMLButtonElement>;
};
export const BtnCloseModal = ({ onCLick }: Props) => {
  return (
    <button
      className="absolute top-2 right-3 text-red-500 transition"
      onClick={onCLick}
    >
      <IoClose size={40} />
    </button>
  );
};
