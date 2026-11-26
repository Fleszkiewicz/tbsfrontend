// Bloques de carga tipo esqueleto. El contenedor que los agrupa lleva `animate-pulse`.

export function Bone({ className = "" }: { className?: string }) {
  return <div className={`bg-gray-200 rounded-md ${className}`} />;
}

// Imita SectionCard de Trip: cabecera con ícono + título y cuerpo
function SectionSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gray-100" />
        <Bone className="h-4 w-40" />
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// Campo de formulario: etiqueta + input redondeado
function FieldSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <Bone className="h-3 w-20" />
      <div className="h-10 rounded-xl bg-gray-100" />
    </div>
  );
}

/** Detalle de expediente mientras se obtiene el legajo */
export function TripSkeleton() {
  return (
    <div className="max-w-[900px] mx-auto px-4 pt-24 md:pt-28 pb-16 animate-pulse" aria-busy="true" aria-label="Cargando expediente">
      {/* Cabecera: volver, legajo + estado, botones */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-8">
        <div>
          <Bone className="h-3.5 w-16 mb-4" />
          <div className="flex items-center gap-3">
            <Bone className="h-9 w-44 rounded-lg" />
            <Bone className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-28 rounded-full bg-gray-200/70" />
          <div className="h-10 w-36 rounded-full bg-gray-300" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Información de viaje */}
        <SectionSkeleton>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-5">
            {Array.from({ length: 6 }, (_, i) => (
              <FieldSkeleton key={i} className="col-span-1 md:col-span-2" />
            ))}
          </div>
        </SectionSkeleton>

        {/* Destinos: tabla con cabecera negra */}
        <SectionSkeleton>
          <div className="rounded-2xl border border-gray-200 overflow-hidden">
            <div className="h-10 bg-gray-300" />
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="grid grid-cols-6 gap-4 items-center px-4 py-3.5 border-b border-gray-100 last:border-0">
                <Bone className="h-3.5 w-24" />
                <Bone className="h-3.5 w-16 mx-auto" />
                <Bone className="h-3.5 w-16 mx-auto" />
                <Bone className="h-3.5 w-8 mx-auto" />
                <Bone className="h-5 w-20 mx-auto rounded-full" />
                <Bone className="h-3.5 w-10 mx-auto" />
              </div>
            ))}
          </div>
        </SectionSkeleton>

        {/* Pasajeros: tarjeta del titular */}
        <SectionSkeleton>
          <div className="border border-gray-200 rounded-2xl p-5">
            <Bone className="h-4 w-24 mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <FieldSkeleton className="col-span-1 md:col-span-2" />
              <FieldSkeleton className="col-span-1 md:col-span-2" />
              <FieldSkeleton className="col-span-2 md:col-span-2" />
              <FieldSkeleton className="col-span-1 md:col-span-3" />
              <FieldSkeleton className="col-span-1 md:col-span-3" />
            </div>
          </div>
        </SectionSkeleton>
      </div>
    </div>
  );
}
