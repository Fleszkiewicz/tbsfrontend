import Swal from "sweetalert2";

/** Aviso al salir con cambios sin guardar. Devuelve true si la persona elige salir igual. */
export async function confirmLeaveUnsaved(): Promise<boolean> {
  const result = await Swal.fire({
    title: "Cambios sin guardar",
    text: "Aún no se han guardado los datos del legajo. Si sales ahora, se perderán.",
    width: "320px",
    showCancelButton: true,
    confirmButtonText: "Salir sin guardar",
    cancelButtonText: "Seguir editando",
    reverseButtons: true,
    backdrop: `rgba(0,0,0,0.3)`,
    color: "#1D1D1F",
    background: "#ffffff",
    customClass: {
      popup:
        "rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-5 px-3",
      title: "text-[16px] font-semibold text-black mt-0",
      htmlContainer: "text-[13px] text-gray-500 font-medium mt-1 mb-6 mx-0",
      actions: "flex w-full gap-2 px-3 m-0",
      confirmButton:
        "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
      cancelButton:
        "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
    },
  });
  return result.isConfirmed;
}
