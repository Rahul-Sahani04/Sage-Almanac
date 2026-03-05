import { query } from "./_generated/server";

export const checkIdentity = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});
