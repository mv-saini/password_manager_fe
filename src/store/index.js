import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const store = createStore({
    state:{
        token: null,
        authenticated: false,
        uiLengthMax: 20,
        uiLengthMin: 8,
        user: null,
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
        }
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
        }
    },
    plugins: [createPersistedState()],
})

export default store