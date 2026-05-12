import { useState } from "react";
import { IoAttach, IoCloudUploadOutline } from "react-icons/io5";
import { LuFileText, LuDownload, LuTrash2 } from "react-icons/lu";
import { FileUploadModal } from "../modals/FileUploadModal";
import { toast } from "sonner";
import type { TripFile } from "../../types/types";

type FilesCardProps = {
  files: TripFile[];
  onUpload: (files: File[], category: string) => void;
  onDelete: (id: string) => void;
};

export const FilesCard = ({ files, onUpload, onDelete }: FilesCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (file: TripFile) => {
    toast.info(`Iniciando descarga de: ${file.nombre}`);
    window.open(file.url, "_blank");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
      {/* Header (Pattern from SectionCard) */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <IoAttach size={18} className="text-black" />
          </div>
          <h2 className="text-[15px] font-semibold text-[#1D1D1F]">Archivos adjuntos</h2>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-[13px] font-semibold rounded-full hover:bg-gray-800 transition-all active:scale-[0.98]"
        >
          <IoCloudUploadOutline size={16} />
          Subir archivo
        </button>
      </div>

      {/* Content Area (p-6 Pattern) */}
      <div className="p-6">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 mb-3">
              <IoAttach size={24} />
            </div>
            <p className="text-[14px] font-medium text-gray-400">No hay archivos adjuntos aún.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1D1D1F] text-white">
                  <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider rounded-tl-2xl">Nombre</th>
                  <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-[12px] font-bold uppercase tracking-wider text-right rounded-tr-2xl">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                          <LuFileText size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-semibold text-[#1D1D1F] line-clamp-1 truncate max-w-[200px]">
                            {file.nombre}
                          </span>
                          <span className="text-[11px] text-gray-400">{file.fecha}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-tight">
                        {file.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-600 transition-all"
                          title="Descargar"
                        >
                          <LuDownload size={16} />
                        </button>
                        <button
                          onClick={() => onDelete(file.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600  transition-all"
                          title="Eliminar"
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FileUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUpload={onUpload}
      />
    </div>
  );
};
