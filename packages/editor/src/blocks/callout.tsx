import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

export type CalloutType = "info" | "warning" | "success" | "error";

const CALLOUT_META: Record<CalloutType, { emoji: string }> = {
  info: { emoji: "💡" },
  warning: { emoji: "⚠️" },
  success: { emoji: "✅" },
  error: { emoji: "⛔" },
};

/**
 * Callout block — an emoji + colored container with editable inline content.
 * `render` drives the editor; `toExternalHTML` drives the server/export HTML.
 * Both emit the same `.callout` markup so editor and published page match.
 */
export const calloutBlock = createReactBlockSpec(
  {
    type: "callout",
    propSchema: {
      textAlignment: defaultProps.textAlignment,
      textColor: defaultProps.textColor,
      type: {
        default: "info",
        values: ["info", "warning", "success", "error"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const meta = CALLOUT_META[props.block.props.type] ?? CALLOUT_META.info;
      return (
        <div className="callout" data-callout-type={props.block.props.type}>
          <span className="callout-emoji" contentEditable={false}>
            {meta.emoji}
          </span>
          <div className="callout-content" ref={props.contentRef} />
        </div>
      );
    },
    toExternalHTML: (props) => {
      const meta = CALLOUT_META[props.block.props.type] ?? CALLOUT_META.info;
      return (
        <aside className="callout" data-callout-type={props.block.props.type}>
          <span className="callout-emoji">{meta.emoji}</span>
          <div className="callout-content" ref={props.contentRef} />
        </aside>
      );
    },
  },
);
