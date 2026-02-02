import { render, screen } from "@testing-library/react";

import MetadataTree from "../src/components/metadata-tree";


test("renders metadata tree", () => {
  render(
    <MetadataTree
      schemas={[
        {
          name: "public",
          tables: [{ name: "users", columns: [{ name: "id", dataType: "int", isNullable: false }] }],
          views: [],
        },
      ]}
    />
  );
  expect(screen.getByText("public")).toBeInTheDocument();
  expect(screen.getByText("表: users")).toBeInTheDocument();
});
