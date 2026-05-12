import { IoCloseOutline, IoExpandOutline } from "react-icons/io5";

type FilePreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  file: {
    nombre: string;
    url: string;
  } | null;
};

export const FilePreviewModal = ({ isOpen, onClose, file }: FilePreviewModalProps) => {
  if (!isOpen || !file) return null;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.nombre);
  const isPDF = /\.pdf$/i.test(file.nombre);

  return (
    <section
      className="fixed inset-0 bg-black/80 z-[2000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[1000px] h-full flex flex-col bg-white rounded-[24px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-white z-10">
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold text-[#1D1D1F] line-clamp-1">{file.nombre}</h3>
            <span className="text-[11px] text-gray-400 font-medium">Vista previa sin descarga</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(file.url, "_blank")}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-black hover:text-white transition-all"
              title="Abrir en pestaña nueva"
            >
              <IoExpandOutline size={18} />
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"
              title="Cerrar"
            >
              <IoCloseOutline size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-gray-50 flex items-center justify-center overflow-auto p-4">
          {isImage ? (
            <img
              src={file.url}
              alt={file.nombre}
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
            />
          ) : isPDF ? (
            <iframe
              src={`${file.url}#toolbar=0`}
              className="w-full h-full rounded-lg"
              title="PDF Preview"
            />
          ) : (
            <div className="text-center p-10">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                <IoCloseOutline size={32} />
              </div>
              <p className="text-[14px] font-semibold text-gray-800">No se puede previsualizar este archivo</p>
              <p className="text-[12px] text-gray-500 mt-1">Este formato no es compatible con la vista previa rápida.</p>
              <button
                onClick={() => window.open(file.url, "_blank")}
                className="mt-6 px-6 py-2.5 bg-black text-white text-[13px] font-bold rounded-full hover:bg-gray-800 transition-all"
              >
                Descargar para ver
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
