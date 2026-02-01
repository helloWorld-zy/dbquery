import { render, screen } from "@testing-library/react";

import ConnectionsPage from "../src/pages/connections";


test("renders connection form", () => {
  render(<ConnectionsPage />);
  expect(screen.getByText("Connections")).toBeInTheDocument();
  expect(screen.getByLabelText("Name")).toBeInTheDocument();
  expect(screen.getByLabelText("Database")).toBeInTheDocument();
});
