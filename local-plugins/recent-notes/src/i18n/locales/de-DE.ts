export default {
  components: {
    recentNotes: {
      title: "Zuletzt bearbeitet",
      seeRemainingMore: ({ remaining }: { remaining: number }) => `${remaining} weitere ansehen →`,
    },
  },
};
