import { computed, ref } from 'vue'
import { tokenNotValid, refreshToken } from '../TokenJS/RefreshInvalidToken';
import store from '@/store'

export const months = ref([
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

export async function getUser() {
    const response = await fetch(process.env.VUE_APP_USER + '/showdetails?email=' + computed(() => store.getters.getUser).value, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
        },
    })
    if(response.status == 200){
        const resData = await response.json()
        store.dispatch('set_user_name', resData.user.name)
        store.dispatch('set_user_surname', resData.user.surname)
        if(resData.user.dob != undefined){
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
        else{
            store.dispatch('set_contact_info_phone', null)
            store.dispatch('set_contact_info_code', null)
        }
    }
    else if(response.status == 403) tokenNotValid()
    else if(response.status == 498){
        await refreshToken()
        await getUser()
    }
}

/**Updates the specified field and its value with check function*/
export async function update(field, value) {
    if (!checkUpdate(field, value)) return
    await helperUpdate(field, value)
}

/**Updates the specified field and its value without a check Function */
export async function helperUpdate(field, value) {
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
function checkUpdate(field, value) {
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
        store.dispatch('set_lastop', true)
        await getUser()
        store.dispatch('set_show_comp', 'ShowAll')
    }
    else if (response.status == 401) {
        store.dispatch('change_error_modify_detail', true)
        store.dispatch('set_error_modify_detail_msg', "Old password isn't correct")
        store.dispatch('set_lastop', false)
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