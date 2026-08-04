export default {
  components: {
    contentMeta: {
      readingTime: ({ minutes }: { minutes: number }) =>
        minutes === 1 ? "1 Minute Lesezeit." : `${minutes} Minuten Lesezeit.`,
    },
  },
};
