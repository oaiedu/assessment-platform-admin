
const initialState = () => ({
  theme: 'light'
  });

  const state = initialState();

  const mutations = {
    toggleTheme(state, data) {
      if (state.theme == 'light'){
        state.theme = 'dark'
      }else{
        state.theme = 'light'
      }
    }
  }
  
  export default {
    state,
    mutations
  };
  