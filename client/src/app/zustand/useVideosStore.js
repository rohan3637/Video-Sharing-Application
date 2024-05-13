import { create } from "zustand";

const useVideosStore = create((set) => ({
  searchedVideos: [],
  updateSearchedVideos: (videos) => set({ searchedVideos: videos }),
}));

export default useVideosStore;
