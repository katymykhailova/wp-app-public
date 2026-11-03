// import { createSlice } from '@reduxjs/toolkit';

// const uiSlice = createSlice({
//   name: 'ui',
//   initialState: {
//     modals: {
//       createArtist: false,
//       editArtist: false,
//       deleteConfirm: false,
//     },
//     editingArtistId: null,
//     deletingArtistId: null,
//   },
//   reducers: {
//     openModal: (state, action) => {
//       const { modalName, data } = action.payload;
//       state.modals[modalName] = true;

//       // Сохраняем доп. данные если нужно
//       if (modalName === 'editArtist' && data?.artistId) {
//         state.editingArtistId = data.artistId;
//       }
//       if (modalName === 'deleteConfirm' && data?.artistId) {
//         state.deletingArtistId = data.artistId;
//       }
//     },
//     closeModal: (state, action) => {
//       const modalName = action.payload;
//       state.modals[modalName] = false;

//       // Очищаем связанные данные
//       if (modalName === 'editArtist') {
//         state.editingArtistId = null;
//       }
//       if (modalName === 'deleteConfirm') {
//         state.deletingArtistId = null;
//       }
//     },
//     closeAllModals: (state) => {
//       Object.keys(state.modals).forEach((key) => {
//         state.modals[key] = false;
//       });
//       state.editingArtistId = null;
//       state.deletingArtistId = null;
//     },
//   },
// });

// export const { openModal, closeModal, closeAllModals } = uiSlice.actions;
// export default uiSlice.reducer;
