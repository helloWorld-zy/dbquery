import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import ConnectionsPage from "../src/pages/connections";

vi.mock("../src/services/connections", async () => {
  return {
    listConnections: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 0 }),
    createConnection: vi.fn(),
    deleteConnection: vi.fn(),
    testConnection: vi.fn(),
  };
});

test("renders connection form", async () => {
  render(<ConnectionsPage />);
  expect(screen.getByText("Connections")).toBeInTheDocument();
  expect(await screen.findByLabelText("Name")).toBeInTheDocument();
  expect(screen.getByLabelText("Database")).toBeInTheDocument();
});
