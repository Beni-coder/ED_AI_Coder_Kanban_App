export type Card = {
  id: string;
  title: string;
  details: string;
};

export type Column = {
  id: string;
  title: string;
  cardIds: string[];
};

export type BoardData = {
  columns: Column[];
  cards: Record<string, Card>;
};

export const initialData: BoardData = {
  columns: [
    { id: "col-backlog", title: "Backlog", cardIds: ["card-1", "card-2"] },
    { id: "col-discovery", title: "Découverte", cardIds: ["card-3"] },
    {
      id: "col-progress",
      title: "En cours",
      cardIds: ["card-4", "card-5"],
    },
    { id: "col-review", title: "Révision", cardIds: ["card-6"] },
    { id: "col-done", title: "Terminé", cardIds: ["card-7", "card-8"] },
  ],
  cards: {
    "card-1": {
      id: "card-1",
      title: "Aligner les thèmes de la feuille de route",
      details:
        "Rédiger les thèmes trimestriels avec les impacts et les indicateurs.",
    },
    "card-2": {
      id: "card-2",
      title: "Recueillir les signaux clients",
      details:
        "Examiner les étiquettes du support, les notes commerciales et les retours d'attrition.",
    },
    "card-3": {
      id: "card-3",
      title: "Prototyper la vue analytique",
      details:
        "Esquisser la mise en page du tableau de bord et les principales explorations.",
    },
    "card-4": {
      id: "card-4",
      title: "Affiner le vocabulaire des statuts",
      details:
        "Harmoniser les libellés des colonnes et le ton sur l'ensemble du tableau.",
    },
    "card-5": {
      id: "card-5",
      title: "Designer la mise en page des cartes",
      details:
        "Ajouter de la hiérarchie et de l'espacement pour parcourir les listes denses.",
    },
    "card-6": {
      id: "card-6",
      title: "QA des micro-interactions",
      details: "Vérifier les états de survol, de focus et de chargement.",
    },
    "card-7": {
      id: "card-7",
      title: "Livrer la page marketing",
      details: "Texte final validé et pack de ressources livré.",
    },
    "card-8": {
      id: "card-8",
      title: "Clôturer le sprint d'intégration",
      details: "Documenter les notes de version et partager en interne.",
    },
  },
};

const isColumnId = (columns: Column[], id: string) =>
  columns.some((column) => column.id === id);

const findColumnId = (columns: Column[], id: string) => {
  if (isColumnId(columns, id)) {
    return id;
  }
  return columns.find((column) => column.cardIds.includes(id))?.id;
};

export const moveCard = (
  columns: Column[],
  activeId: string,
  overId: string
): Column[] => {
  const activeColumnId = findColumnId(columns, activeId);
  const overColumnId = findColumnId(columns, overId);

  if (!activeColumnId || !overColumnId) {
    return columns;
  }

  const activeColumn = columns.find((column) => column.id === activeColumnId);
  const overColumn = columns.find((column) => column.id === overColumnId);

  if (!activeColumn || !overColumn) {
    return columns;
  }

  const isOverColumn = isColumnId(columns, overId);

  if (activeColumnId === overColumnId) {
    if (isOverColumn) {
      const nextCardIds = activeColumn.cardIds.filter(
        (cardId) => cardId !== activeId
      );
      nextCardIds.push(activeId);
      return columns.map((column) =>
        column.id === activeColumnId
          ? { ...column, cardIds: nextCardIds }
          : column
      );
    }

    const oldIndex = activeColumn.cardIds.indexOf(activeId);
    const newIndex = activeColumn.cardIds.indexOf(overId);

    if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) {
      return columns;
    }

    const nextCardIds = [...activeColumn.cardIds];
    nextCardIds.splice(oldIndex, 1);
    nextCardIds.splice(newIndex, 0, activeId);

    return columns.map((column) =>
      column.id === activeColumnId
        ? { ...column, cardIds: nextCardIds }
        : column
    );
  }

  const activeIndex = activeColumn.cardIds.indexOf(activeId);
  if (activeIndex === -1) {
    return columns;
  }

  const nextActiveCardIds = [...activeColumn.cardIds];
  nextActiveCardIds.splice(activeIndex, 1);

  const nextOverCardIds = [...overColumn.cardIds];
  if (isOverColumn) {
    nextOverCardIds.push(activeId);
  } else {
    const overIndex = overColumn.cardIds.indexOf(overId);
    const insertIndex = overIndex === -1 ? nextOverCardIds.length : overIndex;
    nextOverCardIds.splice(insertIndex, 0, activeId);
  }

  return columns.map((column) => {
    if (column.id === activeColumnId) {
      return { ...column, cardIds: nextActiveCardIds };
    }
    if (column.id === overColumnId) {
      return { ...column, cardIds: nextOverCardIds };
    }
    return column;
  });
};

export const createId = (prefix: string) => {
  const randomPart = Math.random().toString(36).slice(2, 8);
  const timePart = Date.now().toString(36);
  return `${prefix}-${randomPart}${timePart}`;
};
