import { Table } from "../../layout/Table";
import type { TripFile } from "../../types/types";
import { LuFileText, LuDownload, LuTrash2 } from "react-icons/lu";
import { toast } from "sonner";
import { useState } from "react";
import { IoEyeOutline, IoCloudUploadOutline } from "react-icons/io5";
import { FilePreviewModal } from "../modals/FilePreviewModal";

type ArchiveTableProps = {
  files: TripFile[];
  onUpload: () => void;
  onDelete: (id: string) => void;
};

const headers = [
  { label: "Nombre", key: "nombre" },
  { label: "Categoría", key: "categoria" },
  { label: "Acciones", key: "acciones", className: "text-right" },
];
export const ArchiveTable = ({ files, onUpload, onDelete }: ArchiveTableProps) => {
  const [previewFile, setPreviewFile] = useState<TripFile | null>(null);

  const handleDownload = (file: TripFile) => {
    toast.info(`Iniciando descarga de: ${file.nombre}`);
    window.open(file.url, "_blank");
  };

  const sortedFiles = [...files].sort((a, b) => a.categoria.localeCompare(b.categoria));

  return (
    <>
      <Table
        headers={headers}
        data={sortedFiles}
        noDataMessage="No hay archivos adjuntos aún."
        footerAction={
          <button
            type="button"
            onClick={onUpload}
            className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
          >
            <IoCloudUploadOutline size={18} />
            Subir archivo
          </button>
        }
        renderRow={(file) => (
          <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors group">
            <td className="px-6">
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
            <td className="px-6 py-4 text-center">
              <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-tight">
                {file.categoria}
              </span>
            </td>
            <td className="px-6 py-4 text-right">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setPreviewFile(file)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-all"
                  title="Vista previa"
                >
                  <IoEyeOutline size={18} />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all"
                  title="Descargar"
                >
                  <LuDownload size={16} />
                </button>
                <button
                  onClick={() => onDelete(file.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all"
                  title="Eliminar"
                >
                  <LuTrash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        )}
      />
      <FilePreviewModal 
        isOpen={!!previewFile} 
        onClose={() => setPreviewFile(null)} 
        file={previewFile} 
      />
    </>
  );
};
