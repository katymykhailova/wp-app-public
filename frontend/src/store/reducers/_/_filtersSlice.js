// import { createSlice } from "@reduxjs/toolkit";

// const filtersSlice = createSlice({
//   name: "filters",
//   initialState: {
//     artists: {
//       search: "",
//       genre: "all",
//       sortBy: "name", // 'name' | 'date' | 'popularity'
//       sortOrder: "asc", // 'asc' | 'desc'
//       page: 1,
//       limit: 20,
//     },
//     transactions: {
//       dateFrom: null,
//       dateTo: null,
//       category: "all",
//       minAmount: 0,
//       maxAmount: null,
//     },
//   },
//   reducers: {
//     setArtistFilter: (state, action) => {
//       const { key, value } = action.payload;
//       state.artists[key] = value;

//       // Сбрасываем страницу при изменении фильтров
//       if (key !== "page") {
//         state.artists.page = 1;
//       }
//     },
//     setArtistFilters: (state, action) => {
//       state.artists = { ...state.artists, ...action.payload, page: 1 };
//     },
//     resetArtistFilters: (state) => {
//       state.artists = {
//         search: "",
//         genre: "all",
//         sortBy: "name",
//         sortOrder: "asc",
//         page: 1,
//         limit: 20,
//       };
//     },
//     setTransactionFilter: (state, action) => {
//       const { key, value } = action.payload;
//       state.transactions[key] = value;
//     },
//     resetTransactionFilters: (state) => {
//       state.transactions = {
//         dateFrom: null,
//         dateTo: null,
//         category: "all",
//         minAmount: 0,
//         maxAmount: null,
//       };
//     },
//   },
// });

// export const {
//   setArtistFilter,
//   setArtistFilters,
//   resetArtistFilters,
//   setTransactionFilter,
//   resetTransactionFilters,
// } = filtersSlice.actions;

// export default filtersSlice.reducer;

// // Селекторы
// export const selectArtistFilters = (state) => state.filters.artists;
// export const selectTransactionFilters = (state) => state.filters.transactions;
