import { createReactBlockSpec } from "@blocknote/react";

/** Normalize common share URLs (YouTube) into embeddable iframe URLs. */
export function toEmbedUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (url.hostname === "youtu.be") {
      return `https://www.youtube.com/embed${url.pathname}`;
    }
    if (url.hostname.endsWith("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    return raw;
  } catch {
    return raw;
  }
}

/**
 * Embed block — renders an external iframe (YouTube, etc.) from a `url` prop.
 * When the url is empty (just inserted), shows an inline form to paste one.
 */
export const embedBlock = createReactBlockSpec(
  {
    type: "embed",
    propSchema: {
      url: { default: "" },
    },
    content: "none",
  },
  {
    render: (props) => {
      const url = props.block.props.url;
      if (url) {
        return (
          <div className="embed" contentEditable={false}>
            <iframe
              src={toEmbedUrl(url)}
              title="embed"
              loading="lazy"
              allowFullScreen
            />
          </div>
        );
      }

      let inputEl: HTMLInputElement | null = null;
      return (
        <div className="embed-form" contentEditable={false}>
          <input
            ref={(el) => {
              inputEl = el;
            }}
            type="url"
            placeholder="유튜브/임베드 URL을 붙여넣으세요"
          />
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => {
              const value = inputEl?.value.trim();
              if (value) {
                props.editor.updateBlock(props.block, {
                  type: "embed",
                  props: { url: value },
                });
              }
            }}
          >
            삽입
          </button>
        </div>
      );
    },
    toExternalHTML: (props) => {
      const url = props.block.props.url;
      if (!url) return <div className="embed" />;
      return (
        <div className="embed">
          <iframe
            src={toEmbedUrl(url)}
            title="embed"
            loading="lazy"
            allowFullScreen
          />
        </div>
      );
    },
  },
);
