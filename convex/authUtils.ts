import { MutationCtx, QueryCtx } from "./_generated/server";

export async function resolveUser(ctx: QueryCtx | MutationCtx, anonymousId?: string) {
    const identity = await ctx.auth.getUserIdentity();
    if (identity) {
        return identity.subject;
    }
    if (anonymousId && anonymousId.startsWith("anon_")) {
        return anonymousId;
    }
    return null;
}
