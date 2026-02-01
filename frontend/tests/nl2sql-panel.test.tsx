import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import Nl2SqlPanel from "../src/components/nl2sql-panel";

vi.mock("../src/services/generate_sql", () => ({
  generateSql: vi.fn().mockResolvedValue({ sqlText: "select 1" }),
}));


test("renders NL2SQL panel", () => {
  const onGenerated = vi.fn();
  render(<Nl2SqlPanel connectionId="1" onGenerated={onGenerated} />);
  expect(screen.getByPlaceholderText("Ask in natural language...")).toBeInTheDocument();
});
