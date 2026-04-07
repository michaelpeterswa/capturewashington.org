"use client";

import { useRef, useCallback } from "react";
import { useTheme } from "next-themes";
import {
  MDXEditor,
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  toolbarPlugin,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  ListsToggle,
  UndoRedo,
  Separator,
  type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

interface MarkdownEditorProps {
  name: string;
  defaultValue?: string;
  required?: boolean;
}

export function MarkdownEditor({
  name,
  defaultValue = "",
  required,
}: MarkdownEditorProps) {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<MDXEditorMethods>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback((md: string) => {
    if (hiddenRef.current) {
      hiddenRef.current.value = md;
    }
  }, []);

  return (
    <div className="rounded-lg border border-input bg-background overflow-hidden [&_.mdxeditor]:font-sans [&_.mdxeditor]:text-sm">
      <input
        type="hidden"
        name={name}
        ref={hiddenRef}
        defaultValue={defaultValue}
        required={required}
      />
      <MDXEditor
        ref={editorRef}
        className={resolvedTheme === "dark" ? "dark-theme" : ""}
        markdown={defaultValue}
        onChange={handleChange}
        contentEditableClassName="prose max-w-none min-h-[200px] px-3 py-2"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <ListsToggle />
              </>
            ),
          }),
        ]}
      />
    </div>
  );
}
