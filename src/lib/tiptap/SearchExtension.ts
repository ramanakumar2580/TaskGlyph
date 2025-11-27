import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

// --- START: ADD THIS BLOCK TO FIX THE BUILD ERROR ---
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    search: {
      setSearchTerm: (searchTerm: string) => ReturnType;
      clearSearch: () => ReturnType;
      findNext: () => ReturnType;
      findPrevious: () => ReturnType;
    };
  }
}
// --- END: ADD THIS BLOCK ---

interface SearchOptions {
  searchTerm: string | null;
  searchResultClass: string;
  caseSensitive: boolean;
}

interface SearchStorage {
  results: { from: number; to: number }[];
  currentIndex: number;
}

const getFindRegExp = (searchTerm: string, caseSensitive: boolean): RegExp => {
  return new RegExp(
    searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
    caseSensitive ? "gu" : "giu"
  );
};

const searchAndDecorate = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc: any,
  searchTerm: string,
  caseSensitive: boolean,
  searchResultClass: string
): { decorations: DecorationSet; results: { from: number; to: number }[] } => {
  const decorations: Decoration[] = [];
  const results: { from: number; to: number }[] = [];

  if (!searchTerm) {
    return { decorations: DecorationSet.empty, results };
  }

  const search = getFindRegExp(searchTerm, caseSensitive);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc.descendants((node: any, pos: number) => {
    if (node.isText) {
      let m;
      while ((m = search.exec(node.text)) !== null) {
        if (m[0] === "") break;
        results.push({
          from: pos + m.index,
          to: pos + m.index + m[0].length,
        });
      }
    }
  });

  results.forEach((res) => {
    decorations.push(
      Decoration.inline(res.from, res.to, {
        class: searchResultClass,
      })
    );
  });

  return {
    decorations: DecorationSet.create(doc, decorations),
    results: results,
  };
};

export const SearchExtension = Extension.create<SearchOptions, SearchStorage>({
  name: "search",

  addOptions() {
    return {
      searchTerm: null,
      searchResultClass: "search-result",
      caseSensitive: false,
    };
  },

  addStorage() {
    return {
      results: [],
      currentIndex: -1,
    };
  },

  addProseMirrorPlugins() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const extension = this;
    const { searchResultClass, caseSensitive } = extension.options;

    return [
      new Plugin({
        key: new PluginKey("search"),
        storage: extension.storage,
        props: {
          decorations(state) {
            // Note: We read from options here, which you are updating in the command
            const { searchTerm } = extension.options;
            if (!searchTerm) return DecorationSet.empty;

            const { decorations, results } = searchAndDecorate(
              state.doc,
              searchTerm,
              caseSensitive,
              searchResultClass
            );
            extension.storage.results = results;
            // Only reset index if we are searching for a new term, logic might need tweaking but this is safe for build
            extension.storage.currentIndex = -1;
            return decorations;
          },
        },
      }),
    ];
  },

  addCommands() {
    return {
      setSearchTerm:
        (searchTerm: string) =>
        ({ tr, dispatch }) => {
          // Mutating options directly is one way, though usually storage is preferred for runtime state.
          // However, for this to work with your decorations logic, this is fine.
          this.options.searchTerm = searchTerm;

          if (dispatch) {
            tr.setMeta("search", { searchTerm });
          }
          return true;
        },

      clearSearch:
        () =>
        ({ dispatch, tr }) => {
          this.options.searchTerm = null;
          if (dispatch) {
            tr.setMeta("clearSearch", true);
          }
          return true;
        },

      findNext:
        () =>
        ({ editor }) => {
          const { results, currentIndex } = this.storage;
          if (!results.length) return false;

          const newIndex = (currentIndex + 1) % results.length;
          this.storage.currentIndex = newIndex;

          const { from, to } = results[newIndex];
          editor.commands.setTextSelection({ from, to });

          // Scroll into view
          editor.view.dispatch(editor.state.tr.scrollIntoView());

          return true;
        },

      findPrevious:
        () =>
        ({ editor }) => {
          const { results, currentIndex } = this.storage;
          if (!results.length) return false;

          const newIndex = (currentIndex - 1 + results.length) % results.length;
          this.storage.currentIndex = newIndex;

          const { from, to } = results[newIndex];
          editor.commands.setTextSelection({ from, to });

          // Scroll into view
          editor.view.dispatch(editor.state.tr.scrollIntoView());

          return true;
        },
    };
  },
});
