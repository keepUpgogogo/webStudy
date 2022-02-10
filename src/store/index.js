import {
  createStore
} from 'vuex'

export default createStore({
  state: {
    name: 'xxxxx',
    Adata: null,
    Bdata: {}
  },
  mutations: {
    // 参数一：state，参数二：新值
    getname(state, newValue) {
      state.name = newValue
    },
    getAData(state, newValue) {
      state.Adata = newValue
    },
    getBData(state, newValue) {
      state.Bdata = newValue
    }
  },
  actions: {
    setName(context, value) {
      context.commit('getname', value)
    }

  },
  modules: {}
})
