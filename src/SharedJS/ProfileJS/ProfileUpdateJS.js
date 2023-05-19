import { computed, ref } from 'vue'
import { getUser, tokenNotValid, refreshToken } from './ProfileUserJS';
import store from '@/store'

const months = ref([
    {
        month: "January",
        days: 31
    },
    {
        month: "Febraury",
        days: 28
    },
    {
        month: "March",
        days: 31
    },
    {
        month: "April",
        days: 30
    },
    {
        month: "May",
        days: 31
    },
    {
        month: "June",
        days: 30
    },
    {
        month: "July",
        days: 31
    },
    {
        month: "August",
        days: 31
    },
    {
        month: "September",
        days: 30
    },
    {
        month: "October",
        days: 31
    },
    {
        month: "November",
        days: 30
    },
    {
        month: "December",
        days: 31
    },
])

/**Updates the specified field and its value with check function*/
export async function update(field, value) {
    if (!await checkUpdate(field, value)) return
    await helperUpdate(field, value)
}

/**Updates the specified field and its value without a check Function */
async function helperUpdate(field, value) {
    const response = await fetch(process.env.VUE_APP_USER + "/changedetails", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
        },
        body: JSON.stringify({ "field": field, "value": value })
    })
    if (response.status == 200) {
        store.dispatch('set_lastop', true)
        await getUser()
        store.dispatch('set_show_comp', 'ShowAll')
    }
    else if (response.status == 403) tokenNotValid()
    else if (response.status == 498) {
        await refreshToken()
        await helperUpdate(field, value)
    }
}

/**Checks the data fields before sending them to back-end */
async function checkUpdate(field, value) {
    switch (field.toUpperCase()) {
        case 'NAME': return checkUpdateNameSurname(field, value)
        case 'SURNAME': return checkUpdateNameSurname(field, value)
        case 'DOB': return checkUpdateBirthday(value)
        case 'GENDER': return true
        case 'RECOVERY_MAIL': return checkUpdateRecoveryMail(value)
        case 'PHONE': return checkUpdatePhone(value)
    }
}

/**Checks the user name and surname */
function checkUpdateNameSurname(field, value) {
    if (value == '') {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', field + ' is required.')
        return false
    }
    else {
        store.dispatch('change_error_modify_detail', false)
        return true
    }
}

/**Checks the suer Birthday */
function checkUpdateBirthday(value) {
    if (value.split('-')[0] == 'null' || value.split('-')[1] == 'null' || value.split('-')[2] == 'null') {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Birthday is required.')
        return false
    }
    else {
        if (!/^\d+$/.test(value.split('-')[0])) {
            store.dispatch('change_error_modify_detail', true)
            store.dispatch('set_error_modify_detail_msg', 'Day is invalid, it must only contain numbers.')
            return false
        }
        if (!/^\d+$/.test(value.split('-')[2])) {
            store.dispatch('change_error_modify_detail', true)
            store.dispatch('set_error_modify_detail_msg', 'Year is invalid, it must only contain numbers.')
            return false
        }
        if (parseInt(value.split('-')[2]) < (new Date().getFullYear() - 100) || parseInt(value.split('-')[2]) > new Date().getFullYear()) {
            store.dispatch('change_error_modify_detail', true)
            store.dispatch('set_error_modify_detail_msg', 'Year must be between ' + (new Date().getFullYear() - 100) + ' and ' + new Date().getFullYear() + '.')
            return false
        }
        if (value.split('-')[1] == 'Febraury') {
            if (((parseInt(value.split('-')[2]) % 4 == 0) && (parseInt(value.split('-')[2]) % 100 != 0)) || (parseInt(value.split('-')[2]) % 400 == 0)) {
                if (parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days + 1) {
                    store.dispatch('change_error_modify_detail', false)
                    return true
                }
                else {
                    store.dispatch('change_error_modify_detail', true)
                    store.dispatch('set_error_modify_detail_msg', 'Day is invalid.')
                    return false
                }
            }
            else if (parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days) {
                store.dispatch('change_error_modify_detail', false)
                return true
            }
            else {
                store.dispatch('change_error_modify_detail', true)
                store.dispatch('set_error_modify_detail_msg', 'Day is invalid.')
                return false
            }
        }
        else if (parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days) {
            store.dispatch('change_error_modify_detail', false)
            return true
        }
        else {
            store.dispatch('change_error_modify_detail', true)
            store.dispatch('set_error_modify_detail_msg', 'Day is invalid.')
            return false
        }
    }
}

/**Checks the recovery mail */
function checkUpdateRecoveryMail(value) {
    var reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (reg.test(value)) {
        store.dispatch('change_error_modify_detail', false)
        return true
    }
    else {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Email not valid')
        return false
    }
}

/**Removes the recovery mail */
export async function deleteRecoveryMail(field, value) {
    helperUpdate(field, value)
}

/**Checks the user phone number */
function checkUpdatePhone(value) {
    let code = value.split('-')[0]
    let phone = value.split('-')[1]
    if (code == 'null') {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Insert county code')
        return false
    }
    else if (phone == 'null') {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Insert a phone.')
        return false
    }
    if (!/^\d+$/.test(code)) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'County code is invalid, it must only contain numbers.')
        return false
    }
    else if (code.length <= 0 || code.length > 3) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'County code is invalid')
        return false
    }
    if (!/^\d+$/.test(phone)) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Phone number is invalid, it must only contain numbers.')
        return false
    }
    else if (phone.length != 10) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Phone number is invalid')
        return false
    }
    return true
}

/**Removes the phone number */
export async function deletePhone(field, value) {
    await helperUpdate(field, value)
}

/**Checks if password fields are valid */
function checkPass(oldPass, newPass, confirmPass) {
    if (oldPass == null) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Insert old password.')
        return false
    }
    if (!(/[A-Z]/.test(newPass) && /[a-z]/.test(newPass) && /[0-9]/.test(newPass) && /[#?!@$%^&*-]/.test(newPass) && (newPass.length >= 8 || newPass.length <= 30))) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'New password must contain a lowercase, an uppercase, a number and a symbol. Minimum length is 8 and maximum length is 30.')
        return false
    }
    if (newPass == confirmPass) {
        store.dispatch('change_error_modify_detail', false)
        return true
    }
    else {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', 'Passwords do not match.')
        return false
    }
}

/**Calls the back-end to change user password */
export async function changePassword(oldPass, newPass, confirmPass) {
    if (!checkPass(oldPass, newPass, confirmPass)) return
    const response = await fetch(process.env.VUE_APP_USER + "/changepassword", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
        },
        body: JSON.stringify({ "oldpassword": oldPass, "newpassword": newPass })
    })
    if (response.status == 200) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', "Password Changed")
        //lastOP.value = true
        await getUser()
    }
    else if (response.status == 401) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', "Old password isn't correct")
        //lastOP.value = false
        await getUser()
    }
    else if (response.status == 403) tokenNotValid()
    else if (response.status == 498) {
        await refreshToken()
        await changePassword(oldPass, newPass, confirmPass)
    }
}

export function goBack() {
    store.dispatch('set_show_comp', 'ShowAll')
}