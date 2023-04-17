import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const store = createStore({
    state:{
        token: null,
        authenticated: false,
        user: null,
        userName: null,
        userSurname: null,
        loadingColor: 'white',
        theme: 'dark',
        darkMode: true,
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
        getUserName(state){
            return state.userName 
        },
        getUserSurname(state){
            return state.userSurname 
        },
        getLoadingColor(state){
            return state.loadingColor
        },
        getTheme(state){
            return state.theme
        },
        getDarkMode(state){
            return state.darkMode
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
        SET_USER_NAME(state, userName){
            state.userName = userName
        },
        SET_USER_SURNAME(state, userSurname){
            state.userSurname = userSurname
        },
        CHANGE_THEME(state, theme){
            state.theme = theme
        },
        CHANGE_LOADING_COLOR(state, color){
            state.loadingColor = color
        },
        IS_DARK(state, darkMode){
            state.darkMode = darkMode
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
        },
        set_user_name({ commit }, userName){
            commit('SET_USER_NAME', userName)
        },
        set_user_surname({ commit }, userSurname){
            commit('SET_USER_SURNAME', userSurname)
        },
        change_theme({ commit }, theme){
            commit('CHANGE_THEME', theme)
        },
        change_loading_color({ commit }, color){
            commit('CHANGE_LOADING_COLOR', color)
        },
        is_dark({ commit }, darkMode){
            commit('IS_DARK', darkMode)
        }
    },
    plugins: [createPersistedState()],
})

export default store