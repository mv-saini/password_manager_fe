import { createStore } from "vuex";
import createPersistedState from "vuex-persistedstate";

const mainModule = {
    state: () => ({
        token: null,
        refreshToken: null,
        authenticated: false,
        user: null,
        userName: null,
        userSurname: null,
        loadingColor: 'white',
        theme: 'dark',
        darkMode: true,
    }),
    getters: {
        getToken(state){
            return state.token
        },
        getRefreshToken(state){
            return state.refreshToken
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
    mutations: {
        ACCESS_TOKEN(state, token){
            state.token = token
        },
        REFRESH_TOKEN(state, token){
            state.refreshToken = token
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
    actions: {
        access_token({ commit }, token){
            commit('ACCESS_TOKEN', token)
        },
        refresh_token({ commit }, token){
            commit('REFRESH_TOKEN', token)
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
    }
}

const SecModule = {
    state: () => ({
        lastOP: false,
        errorModifyDetail: false,
        errorModifyDetailMsg: '',
        showComps: 'ShowAll',
        compTitle: '',
        basicInfo: {
            Birthday: {
                month: null,
                day: null, 
                year: null
            },
            Gender: null,
        },
        contactInfo: {
            RecoveryEmail: null,
            Phone: null,
            Code: null,
            OldPassword: null,
            NewPasword: null,
            ConfirmNewPassword: null
        },
    }),
    getters: {
        getLastOP(state){
            state.lastOP
        },
        getErrorModifyDetail(state){
            return state.errorModifyDetail
        },
        getErrorModifyDetailMsg(state){
            return state.errorModifyDetailMsg
        },
        getShowComp(state){
            return state.showComps
        },
        getCompTitle(state){
            return state.compTitle
        },
        getBasicInfoBirthday(state){
            return state.basicInfo.Birthday
        },
        getBasicInfoGender(state){
            return state.basicInfo.Gender
        },
        getContactInfoRecoveryEmail(state){
            return state.contactInfo.RecoveryEmail
        },
        getContactInfoPhone(state){
            return state.contactInfo.Phone
        },
        getContactInfoCode(state){
            return state.contactInfo.Code
        },
    },
    mutations: {
        SET_LASTOP(state, res){
            state.lastOP = res
        },
        CHANGE_ERROR_MODIFY_DETAIL(state, change){
            state.errorModifyDetail = change
        },
        SET_ERROR_MODIFY_DETAIL_MSG(state, msg){
            state.errorModifyDetailMsg = msg
        },
        SET_SHOW_COMP(state, comp){
            state.showComps = comp
        },
        SET_COMP_TITLE(state, title){
            state.compTitle = title
        },
        SET_BASIC_INFO_BIRTHDAY_MONTH(state, month){
            state.basicInfo.Birthday.month = month
        },
        SET_BASIC_INFO_BIRTHDAY_DAY(state, day){
            state.basicInfo.Birthday.day = day
        },
        SET_BASIC_INFO_BIRTHDAY_YEAR(state, year){
            state.basicInfo.Birthday.year = year
        },
        SET_BASIC_INFO_GENDER(state, gender){
            state.basicInfo.Gender = gender
        },
        SET_CONTACT_INFO_RECOVERY_EMAIL(state, email){
            state.contactInfo.RecoveryEmail = email
        },
        SET_CONTACT_INFO_PHONE(state, phone){
            state.contactInfo.Phone = phone
        },
        SET_CONTACT_INFO_CODE(state, code){
            state.contactInfo.Code = code
        },
    },
    actions: {
        set_lastop({ commit }, res){
            commit('SET_LASTOP', res)
        },
        change_error_modify_detail({ commit }, change){
            commit('CHANGE_ERROR_MODIFY_DETAIL', change)
        },
        set_error_modify_detail_msg({ commit }, msg){
            commit('SET_ERROR_MODIFY_DETAIL_MSG', msg)
        },
        set_show_comp({ commit }, comp){
            commit('SET_SHOW_COMP', comp)
        },
        set_comp_title({ commit }, title){
            commit('SET_COMP_TITLE', title)
        },
        set_basic_info_birthday_month({ commit }, month){
            commit('SET_BASIC_INFO_BIRTHDAY_MONTH', month)
        },
        set_basic_info_birthday_day({ commit }, day){
            commit('SET_BASIC_INFO_BIRTHDAY_DAY', day)
        },
        set_basic_info_birthday_year({ commit }, year){
            commit('SET_BASIC_INFO_BIRTHDAY_YEAR', year)
        },
        set_basic_info_gender({ commit }, gender){
            commit('SET_BASIC_INFO_GENDER', gender)
        },
        set_contact_info_recovery_email({ commit }, email){
            commit('SET_CONTACT_INFO_RECOVERY_EMAIL', email)
        },
        set_contact_info_phone({ commit }, phone){
            commit('SET_CONTACT_INFO_PHONE', phone)
        },
        set_contact_info_code({ commit }, code){
            commit('SET_CONTACT_INFO_CODE', code)
        },
    },
    
}

const store = createStore({
    modules: {
        main: mainModule,
        sec: SecModule
    },
    plugins: [
        createPersistedState({
            paths: ['main']
        })
    ],
})

export default store