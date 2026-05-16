const fs = require('fs');
const path = require('path');

function updateTrip() {
  const tripPath = path.join(__dirname, 'src/components/pages/Trip.tsx');
  let content = fs.readFileSync(tripPath, 'utf8');

  // 1. Add selectedMoneda state
  // const [selectedMoneda, setSelectedMoneda] = useState<number>(0);
  if (!content.includes('const [selectedMoneda, setSelectedMoneda] = useState<number>(0);')) {
    content = content.replace(
      '  const [destinos, setDestinos] = useState<DestinoEntry[]>([]);',
      '  const [selectedMoneda, setSelectedMoneda] = useState<number>(0);\n  const [destinos, setDestinos] = useState<DestinoEntry[]>([]);'
    );
  }

  // 2. Add to defaultValues
  if (!content.includes('moneda: 0,')) {
    content = content.replace(
      '      apellido: "",\n    } as any,',
      '      apellido: "",\n      moneda: 0,\n      valor_total: null,\n      valor_total_usd: null,\n      cotizacion: null,\n    } as any,'
    );
  }

  // 3. Update useEffect for tripData
  if (!content.includes('setSelectedMoneda(')) {
    content = content.replace(
      '      form.setFieldValue("apellido", tripData.apellido || "");\n    }\n  }, [tripData, form]);',
      `      form.setFieldValue("apellido", tripData.apellido || "");
      
      const monedaMap: Record<string, number> = { "ars": 1, "usd": 2, "mixto": 3 };
      const numMoneda = tripData.moneda ? (monedaMap[tripData.moneda.toLowerCase()] || 0) : 0;
      form.setFieldValue("moneda", numMoneda);
      setSelectedMoneda(numMoneda);
      
      form.setFieldValue("valor_total", tripData.valor_total || null);
      form.setFieldValue("valor_total_usd", tripData.valor_total_usd || null);
      form.setFieldValue("cotizacion", tripData.cotizacion || null);
    }
  }, [tripData, form]);`
    );
  }

  // 4. Insert the UI block after "Pago"
  // Look for:
  //             <div className="flex flex-col col-span-1 md:col-span-2">
  //               <label className={labelCls}>Pago</label>
  //               <CustomSelect
  //                 value=""
  //                 onChange={() => { }}
  //                 options={[
  //                   { label: "Seleccionar", value: "" },
  //                   { label: "Contado", value: "Contado" },
  //                   { label: "Cuotas", value: "Cuotas" },
  //                   { label: "Financiacion", value: "Financiacion" },
  //                 ]}
  //               />
  //             </div>
  //           </div>
  //         </SectionCard>

  const insertBlock = `
            {/* Fila 3+: Detalle económico */}
            <form.Field
              name="moneda"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "La moneda es obligatoria";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col col-span-1 md:col-span-3">
                  <label className={labelCls}>Tipo de moneda</label>
                  <CustomSelect
                    value={field.state.value ?? 0}
                    onChange={(val) => {
                      const numVal = Number(val) as 0 | 1 | 2 | 3;
                      field.handleChange(numVal);
                      setSelectedMoneda(numVal);
                      if (numVal === 2 || numVal === 3) {
                        form.setFieldValue("cotizacion", 0);
                      } else {
                        form.setFieldValue("cotizacion", null);
                      }
                    }}
                    options={[
                      { label: "Seleccionar", value: 0 },
                      { label: "ARS", value: 1 },
                      { label: "USD", value: 2 },
                      { label: "Mixto", value: 3 },
                    ]}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                  )}
                </div>
              )}
            </form.Field>

            {(selectedMoneda === 1 || selectedMoneda === 3) ? (
              <form.Field
                name="valor_total"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "El valor total ARS es obligatorio";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Valor total ARS</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-1">
                        $
                      </span>
                      <input
                        type="text"
                        value={
                          field.state.value
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={\`\${inputCls} pl-7\`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) ? (
              <form.Field
                name="cotizacion"
                validators={{
                  onChange: ({ value }) => {
                    if (!value || Number(value) <= 0) return "La cotización debe ser mayor a 0";
                  },
                  onSubmit: ({ value }) => {
                    if (!value || Number(value) <= 0) return "La cotización es obligatoria y debe ser mayor a 0";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Cotización USD / ARS</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-1">
                        $
                      </span>
                      <input
                        type="text"
                        value={
                          typeof field.state.value === "number"
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={\`\${inputCls} pl-7\`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            ) : (
              <div className="hidden md:block col-span-1 md:col-span-3"></div>
            )}

            {(selectedMoneda === 2 || selectedMoneda === 3) && (
              <form.Field
                name="valor_total_usd"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "El valor total USD es obligatorio";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col col-span-1 md:col-span-3">
                    <label className={labelCls}>Valor total USD</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-semibold text-gray-400 -ml-2">
                        US$
                      </span>
                      <input
                        type="text"
                        value={
                          field.state.value
                            ? new Intl.NumberFormat("es-AR", {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 0,
                            }).format(field.state.value)
                            : ""
                        }
                        onChange={(e) => {
                          const soloNumeros = e.target.value.replace(/\\D/g, "");
                          field.handleChange(Number(soloNumeros));
                        }}
                        placeholder="0"
                        className={\`\${inputCls} pl-10\`}
                      />
                    </div>
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-500 text-[12px] mt-1 font-medium">{field.state.meta.errors.join(", ")}</em>
                    )}
                  </div>
                )}
              </form.Field>
            )}
`;

  // Insert before the closing `</div>` of the grid in "Información de viaje"
  // We can find the exact match for "Financiacion" closing block
  const searchPattern = /\{ label: "Financiacion", value: "Financiacion" \},\s*\]\}\s*\/>\s*<\/div>/;
  
  if (!content.includes('Tipo de moneda')) {
    content = content.replace(searchPattern, (match) => {
      return match + '\n' + insertBlock;
    });
  }

  fs.writeFileSync(tripPath, content);
  console.log('Trip updated successfully');
}

updateTrip();
