import { computed } from 'vue'
import router from '@/router';
import store from '@/store'

export async function getUser() {
    const response = await fetch(process.env.VUE_APP_USER + '/showdetails?email=' + computed(() => store.getters.getUser).value, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
        },
    })
    if(response.status == 200){
        const resData = await response.json()
        if(resData.user.dob != undefined){
            store.dispatch('set_user_name', resData.user.name)
            store.dispatch('set_user_surname', resData.user.surname)
            store.dispatch('set_basic_info_birthday_month', resData.user.dob.split('-')[1])
            store.dispatch('set_basic_info_birthday_day', resData.user.dob.split('-')[0])
            store.dispatch('set_basic_info_birthday_year', resData.user.dob.split('-')[2])
        }
        store.dispatch('set_basic_info_gender', resData.user.gender)
        store.dispatch('set_contact_info_recovery_email', resData.user.recovery_mail)
        if(resData.user.phone != undefined){
            store.dispatch('set_contact_info_phone', resData.user.phone.split("-")[1])
            store.dispatch('set_contact_info_code', resData.user.phone.split("-")[0])
        }
    }
    else if(response.status == 403) tokenNotValid()
    else if(response.status == 498){
        await refreshToken()
        await getUser()
    }
}

/**If the token is not valid removes the authentication */
export function tokenNotValid(){
    store.dispatch('access_token', null)
    store.dispatch('refresh_token', null)
    store.dispatch('change_auth', false)
    store.dispatch('set_user', null)
    store.dispatch('set_user_name', null)
    store.dispatch('set_user_surname', null)
    router.push({
        name: 'login'
    })
}

/**Calls the backend to refresh token */
export async function refreshToken(){
    const response = await fetch(process.env.VUE_APP_TOKEN, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({"token": computed(() => store.getters.getRefreshToken).value})
    })
    const data = await response.json()
    store.dispatch('access_token', data.accessToken)
}