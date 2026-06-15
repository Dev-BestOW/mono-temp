import {
  BlockNoteSchema,
  defaultBlockSpecs,
  type Block,
  type PartialBlock,
} from "@blocknote/core";
import { calloutBlock } from "./blocks/callout";
import { embedBlock } from "./blocks/embed";

/**
 * Single source of truth for the editor schema.
 *
 * The SAME schema is used by the admin editor and the user-web server
 * renderer, so what is edited equals what is published. `table` and all the
 * standard blocks come from `defaultBlockSpecs`; we add `callout` and `embed`.
 */
export const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    callout: calloutBlock(),
    embed: embedBlock(),
  },
});

export type AppBlock = Block<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;

export type AppPartialBlock = PartialBlock<
  typeof schema.blockSchema,
  typeof schema.inlineContentSchema,
  typeof schema.styleSchema
>;
