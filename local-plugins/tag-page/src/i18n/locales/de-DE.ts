export default {
  pages: {
    tagContent: {
      tag: "Schlagwort",
      tagIndex: "Schlagwörter-Übersicht",
      itemsUnderTag: ({ count }: { count: number }) =>
        count === 1 ? "1 Datei mit diesem Schlagwort." : `${count} Dateien mit diesem Schlagwort.`,
      showingFirst: ({ count }: { count: number }) =>
        `Die ersten ${count} Schlagwörter werden angezeigt.`,
      totalTags: ({ count }: { count: number }) => `${count} Schlagwörter insgesamt.`,
    },
  },
  components: {},
};
