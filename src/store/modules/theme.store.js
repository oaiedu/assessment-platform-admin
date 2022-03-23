  const initialState = () => ({
    theme: 'light'
  });

  const state = initialState();

  const mutations = {
    setTheme(state, data){
      state.theme = data
    },
    toggleTheme(state) {
      if (state.theme === 'light'){
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
  