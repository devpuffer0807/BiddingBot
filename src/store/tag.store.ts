import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Tag {
  name: string;
  color: string;
}

interface TagStore {
  tags: Tag[];
  addTag: (tag: Tag) => void;
  editTag: (oldTagName: string, updatedTag: Tag) => void;
  deleteTag: (tagName: string) => void;
  getTags: () => Tag[];
  setTags: (tags: Tag[]) => void;
}

export const useTagStore = create<TagStore>()(
  persist(
    (set, get) => ({
      tags: [],
      addTag: (tag) => set((state) => ({ tags: [...state.tags, tag] })),
      editTag: (oldTagName, updatedTag) =>
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.name === oldTagName ? updatedTag : tag
          ),
        })),
      deleteTag: (tagName) =>
        set((state) => ({
          tags: state.tags.filter((tag) => tag.name !== tagName),
        })),
      getTags: () => {
        const state = get();
        return state.tags;
      },

      setTags: (tags) => set({ tags }), // Add this line
    }),
    {
      name: "tags",
    }
  )
);
