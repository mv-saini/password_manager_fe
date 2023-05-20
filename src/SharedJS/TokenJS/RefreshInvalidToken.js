import router from '@/router';
import { computed } from 'vue'
import store from '@/store'

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