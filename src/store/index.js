import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const store = createStore({
    state:{
        token: null,
        authenticated: false,
        uiLengthMax: 20,
        uiLengthMin: 8,
        user: null,
        loadingColor: 'indigo'
    },
    getters:{
        getToken(state){
            return state.token
        },
        getAuth(state){
            return state.authenticated 
        },
        getUser(state){
            return state.user 
        },
        getUiLengthMax(state){
            return state.uiLengthMax
        },
        getUiLengthMin(state){
            return state.uiLengthMin
        },
        getLoadingColor(state){
            return state.loadingColor
        }
    },
    mutations:{
        ACCESS_TOKEN(state, token){
            state.token = token
        },
        CHANGE_AUTH(state, update){
            state.authenticated = update
        },
        SET_USER(state, user){
            state.user = user
        },
        CHANGE_LOADING_COLOR(state, update){
            state.loadingColor = update
        },
    },
    actions:{
        access_token({ commit }, token){
            commit('ACCESS_TOKEN', token)
        },
        change_auth({ commit }, update){
            commit('CHANGE_AUTH', update)
        },
        set_user({ commit }, user){
            commit('SET_USER', user)
        },
        change_loading_color({ commit }, update){
            commit('CHANGE_LOADING_COLOR', update)
        },
    },
    plugins: [createPersistedState()],
})

export default store