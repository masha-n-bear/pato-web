import { create } from "zustand";

const useStore = create((set, get) => ({
  restaurants: [],
  locations: [],
  collections: [],
  loaded: false,
  loading: false,

  load: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true });
    const base = import.meta.env.BASE_URL;
    const [restRes, locRes, colRes] = await Promise.all([
      fetch(`${base}data/all_restaurants.json`),
      fetch(`${base}data/locations.json`),
      fetch(`${base}data/collections.json`),
    ]);
    const [restaurants, locations, collections] = await Promise.all([
      restRes.json(),
      locRes.json(),
      colRes.json(),
    ]);
    const PRICE_CORRECTIONS = {
      'yuzu-omakase-17-thai-phien': '5',
      'yuzu-omakase-34-thu-khoa-huan': '5',
    };
    set({
      restaurants: restaurants
        .filter((r) => r.status === "Đã hợp tác")
        .map((r) => PRICE_CORRECTIONS[r.handle] ? { ...r, price_range: PRICE_CORRECTIONS[r.handle] } : r),
      locations,
      collections,
      loaded: true,
      loading: false,
    });
  },
}));

export default useStore;
