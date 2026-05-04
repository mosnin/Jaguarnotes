/* eslint-disable */
/**
 * Generated API — do not edit. Run `npx convex dev` to regenerate.
 */
import type { ApiFromModules } from "convex/server";
import type * as notes from "../notes.js";
import type * as shares from "../shares.js";
import type * as presence from "../presence.js";
import type * as users from "../users.js";

declare const fullApi: ApiFromModules<{
  notes: typeof notes;
  shares: typeof shares;
  presence: typeof presence;
  users: typeof users;
}>;
declare type Mounts = typeof fullApi;
export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;

type FilterApi<API, Condition> = Omit<
  {
    [Key in keyof API]: API[Key] extends Condition
      ? API[Key]
      : API[Key] extends object
      ? FilterApi<API[Key], Condition>
      : never;
  },
  never
>;

type FunctionReference<T extends "query" | "mutation" | "action", V extends "public" | "internal"> = {
  _type: T;
  _visibility: V;
};
