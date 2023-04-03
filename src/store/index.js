import { createStore } from "vuex";

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
        CHANGE_AUTH(state){
            state.authenticated = !state.authenticated
        },
        SET_USER(state, user){
            state.user = user
        }
    },
    actions:{
        access_token({ commit }, token){
            commit('ACCESS_TOKEN', token)
            commit('CHANGE_AUTH')
        },
        set_user({ commit }, user){
            commit('SET_USER', user)
        }
    },
})

export default store