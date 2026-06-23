import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { KanbanBoard } from "@/components/KanbanBoard";

const getFirstColumn = () => screen.getAllByTestId(/column-/i)[0];

describe("KanbanBoard", () => {
  it("renders five columns", () => {
    render(<KanbanBoard />);
    expect(screen.getAllByTestId(/column-/i)).toHaveLength(5);
  });

  it("renames a column", async () => {
    render(<KanbanBoard />);
    const column = getFirstColumn();
    const input = within(column).getByLabelText("Titre de la colonne");
    await userEvent.clear(input);
    await userEvent.type(input, "Nouveau nom");
    expect(input).toHaveValue("Nouveau nom");
  });

  it("adds and removes a card", async () => {
    render(<KanbanBoard />);
    const column = getFirstColumn();
    const addButton = within(column).getByRole("button", {
      name: /ajouter une carte/i,
    });
    await userEvent.click(addButton);

    const titleInput = within(column).getByPlaceholderText(/titre de la carte/i);
    await userEvent.type(titleInput, "Nouvelle carte");
    const detailsInput = within(column).getByPlaceholderText(/détails/i);
    await userEvent.type(detailsInput, "Notes");

    await userEvent.click(
      within(column).getByRole("button", { name: /ajouter/i })
    );

    expect(within(column).getByText("Nouvelle carte")).toBeInTheDocument();

    const deleteButton = within(column).getByRole("button", {
      name: /supprimer nouvelle carte/i,
    });
    await userEvent.click(deleteButton);

    expect(within(column).queryByText("Nouvelle carte")).not.toBeInTheDocument();
  });
});
