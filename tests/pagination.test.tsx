import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Pagination } from "../src/components/common/ui/Pagination";

// El paginador muestra el total que le pasa cada página (antes leía siempre el de Home)
describe("Pagination", () => {
  const noop = () => {};
  it("muestra el total recibido", () => {
    expect(renderToString(<Pagination page={1} setPage={noop} totalPages={1} />)).toContain("Página <!-- -->1<!-- --> de <!-- -->1");
    expect(renderToString(<Pagination page={2} setPage={noop} totalPages={3} />)).toContain("Página <!-- -->2<!-- --> de <!-- -->3");
  });
  it("sin páginas no se muestra", () => {
    expect(renderToString(<Pagination page={1} setPage={noop} totalPages={0} />)).toBe("");
  });
});
