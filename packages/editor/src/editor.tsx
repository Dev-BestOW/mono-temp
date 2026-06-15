"use client";

import * as React from "react";
import { BlockNoteView } from "@blocknote/mantine";
import {
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  useCreateBlockNote,
  type DefaultReactSuggestionItem,
} from "@blocknote/react";
import { filterSuggestionItems } from "@blocknote/core";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import "./styles/content.css";
import { schema, type AppBlock, type AppPartialBlock } from "./schema";

export type EditorDocument = AppBlock[];

export interface ContentEditorProps {
  /** Initial document (BlockNote blocks). */
  initialContent?: AppPartialBlock[] | null;
  /** Called on every change with the current document. */
  onChange?: (document: AppBlock[]) => void;
  /** Upload a selected/pasted file and resolve to its public URL. */
  onImageUpload?: (file: File) => Promise<string>;
  /** Minimum height of the editable area (default `480px`). */
  minHeight?: string;
  className?: string;
}

/**
 * Notion-style block editor (slash menu, drag handles, nested blocks) with
 * custom `callout` and `embed` blocks added to the slash menu.
 */
export function ContentEditor({
  initialContent,
  onChange,
  onImageUpload,
  minHeight = "480px",
  className,
}: ContentEditorProps) {
  const uploadRef = React.useRef(onImageUpload);
  uploadRef.current = onImageUpload;

  const editor = useCreateBlockNote({
    schema,
    initialContent:
      initialContent && initialContent.length > 0 ? initialContent : undefined,
    uploadFile: async (file: File) => {
      const upload = uploadRef.current;
      if (!upload) throw new Error("onImageUpload is not configured");
      return upload(file);
    },
  });

  const getItems = async (
    query: string,
  ): Promise<DefaultReactSuggestionItem[]> => {
    const custom: DefaultReactSuggestionItem[] = [
      {
        title: "콜아웃",
        subtext: "강조 박스",
        aliases: ["callout", "콜아웃", "강조", "박스"],
        group: "기타",
        icon: <span>💡</span>,
        onItemClick: () =>
          editor.insertBlocks(
            [{ type: "callout" }],
            editor.getTextCursorPosition().block,
            "after",
          ),
      },
      {
        title: "임베드",
        subtext: "유튜브 등 외부 콘텐츠",
        aliases: ["embed", "임베드", "youtube", "유튜브"],
        group: "미디어",
        icon: <span>🔗</span>,
        onItemClick: () =>
          editor.insertBlocks(
            [{ type: "embed" }],
            editor.getTextCursorPosition().block,
            "after",
          ),
      },
    ];
    return filterSuggestionItems(
      [...getDefaultReactSlashMenuItems(editor), ...custom],
      query,
    );
  };

  return (
    <BlockNoteView
      editor={editor}
      slashMenu={false}
      theme="light"
      className={["content-editor", className].filter(Boolean).join(" ")}
      style={
        { "--content-editor-min-height": minHeight } as React.CSSProperties
      }
      onChange={() => onChange?.(editor.document)}
    >
      <SuggestionMenuController triggerCharacter="/" getItems={getItems} />
    </BlockNoteView>
  );
}
