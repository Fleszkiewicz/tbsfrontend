import { useState, useRef, useEffect } from "react";
import { IoCloseOutline, IoCloudUploadOutline } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";
import { CustomSelect } from "../ui/CustomSelect";
import { toast } from "sonner";
import Swal from "sweetalert2";

type FileUploadModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onUpload: (files: File[], category: string) => void;
};

const labelCls =
    "block text-[12px] text-gray-400 font-medium mb-1.5 select-none";

const CATEGORIES = [
    { label: "Vuelos", value: "Vuelos" },
    { label: "Hoteles", value: "Hoteles" },
    { label: "Seguros", value: "Seguros" },
    { label: "Pasajero", value: "Pasajero" },
];

export const FileUploadModal = ({ isOpen, onClose, onUpload }: FileUploadModalProps) => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [category, setCategory] = useState<string>("");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedFiles([]);
            setCategory("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSafeClose = () => {
        if (selectedFiles.length > 0) {
            Swal.fire({
                title: "¿Cerrar formulario?",
                text: "Se perderán todos los archivos seleccionados y los datos ingresados.",
                width: "300px",
                showCancelButton: true,
                confirmButtonText: "Sí, cerrar",
                cancelButtonText: "Cancelar",
                reverseButtons: true,
                backdrop: `rgba(0,0,0,0.3)`,
                color: "#1D1D1F",
                background: "#ffffff",
                customClass: {
                    popup: "rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-5 px-3",
                    title: "text-[16px] font-semibold text-black mt-0",
                    htmlContainer: "text-[13px] text-gray-500 font-medium mt-1 mb-6 mx-0",
                    actions: "flex w-full gap-2 px-3 m-0",
                    confirmButton: "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
                    cancelButton: "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0"
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    setSelectedFiles([]);
                    setCategory("");
                    onClose();
                }
            });
        } else {
            onClose();
        }
    };

    const handleSubmit = () => {
        if (selectedFiles.length === 0) {
            toast.error("Por favor, selecciona al menos un archivo.");
            return;
        }
        onUpload(selectedFiles, category);
        setSelectedFiles([]);
        setCategory("");
        onClose();
    };

    return (
        <section
            className="fixed inset-0 bg-black/40 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={handleSafeClose}
        >
            <div
                className="w-full max-w-[500px] bg-white rounded-[20px] shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-5">
                    <h2 className="text-[20px] font-semibold text-[#1D1D1F]">Subir archivos</h2>
                    <button
                        onClick={handleSafeClose}
                        className="text-gray-400 hover:text-black transition-colors"
                    >
                        <IoCloseOutline size={22} />
                    </button>
                </div>

                <div className="border-t border-gray-100" />

                {/* Body */}
                <div className="p-6 flex flex-col gap-6 max-h-[70vh] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                    {/* Category Select */}
                    <div className="flex flex-col">
                        <label className={labelCls}>Categoría (para todos los archivos)</label>
                        <CustomSelect
                            value={category}
                            onChange={(val) => setCategory(val)}
                            options={CATEGORIES}
                            placeholder="Seleccionar"
                        />
                    </div>

                    {/* Drag & Drop Area */}
                    <div className="flex flex-col">
                        <label className={labelCls}>Archivos</label>
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                relative h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300
                ${isDragging ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}
                ${selectedFiles.length > 0 ? "bg-gray-50/20" : "bg-gray-50/10"}
              `}
                        >
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />

                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center">
                                <IoCloudUploadOutline size={20} />
                            </div>

                            <div className="text-center px-4">
                                <p className="text-[13px] font-semibold text-[#1D1D1F]">
                                    Haz clic o arrastra más archivos
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                        <div className="flex flex-col gap-2">
                            <label className={labelCls}>Seleccionados ({selectedFiles.length})</label>
                            <div className="flex flex-col gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 group animate-in slide-in-from-left-2 duration-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-gray-400 shrink-0 shadow-sm">
                                                <IoCloudUploadOutline size={16} />
                                            </div>
                                            <div className="flex flex-col overflow-hidden">
                                                <span className="text-[13px] font-semibold text-[#1D1D1F] truncate pr-4">
                                                    {file.name}
                                                </span>
                                                <span className="text-[11px] text-gray-400">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFile(idx);
                                            }}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="border-t border-gray-100" />

                {/* Footer */}
                <div className="px-6 py-5">
                    <button
                        onClick={handleSubmit}
                        disabled={selectedFiles.length === 0}
                        className="w-full bg-black hover:bg-gray-900 text-white font-semibold text-[14px] rounded-full py-3 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed select-none"
                    >
                        Subir {selectedFiles.length > 0 ? `${selectedFiles.length} archivos` : "archivos"}
                    </button>
                </div>
            </div>
        </section>
    );
};
