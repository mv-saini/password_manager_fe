<script setup>
    import router from '@/router';
import { reactive, computed, onMounted, ref, watch } from 'vue';
    import { useStore } from 'vuex';

    const store = useStore()
    const showAll = ref(true)
    const showComp = ref('')
    const color = "#2196f3"
    const lastOP = ref(false)
    const loadingColor = computed(() => store.getters.getLoadingColor)

    const showHideOldPass = ref(false)
    const showHideNewPass = ref(false)
    const showHideNewConfimPass = ref(false)

    const basicInfo = reactive({
        Name: computed(() => store.getters.getUserName).value,
        Surname: computed(() => store.getters.getUserSurname).value,
        Birthday: {
            month: null,
            day: null, 
            year: null
        },
        Gender: null,
    })

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

    const addRecoveryMail = ref(null)
    const addPhone = ref(null)

    const contactInfo = reactive({
        Email: computed(() => store.getters.getUser).value,
        RecoveryEmail: null,
        Phone: null,
        Code: null,
        OldPassword: null,
        NewPasword: null,
        ConfirmNewPassword: null
    })

    onMounted(async () => {
        if (computed(() => store.getters.getAuth).value) {
            await getUser()
        }
    })

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1200);
    })

    /**If the token is not valid removes the authentication */
    function tokenNotValid(){
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
    async function refreshToken(){
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

    async function getUser() {
        const response = await fetch(process.env.VUE_APP_USER + '/' + computed(() => store.getters.getUser).value, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if(response.status == 200){
            const resData = await response.json()
            basicInfo.Name = resData.user.name
            basicInfo.Surname = resData.user.surname
            store.dispatch('set_user_name', basicInfo.Name)
            store.dispatch('set_user_surname', basicInfo.Surname)
            if(resData.user.dob != undefined){
                basicInfo.Birthday.day = resData.user.dob.split('-')[0]
                basicInfo.Birthday.month = resData.user.dob.split('-')[1]
                basicInfo.Birthday.year = resData.user.dob.split('-')[2]
            }
            basicInfo.Gender = resData.user.gender
            contactInfo.RecoveryEmail = resData.user.recovery_mail
            if(resData.user.phone != undefined){
                contactInfo.Phone = resData.user.phone.split("-")[1]
                contactInfo.Code = resData.user.phone.split("-")[0]
            }
        }
        else if(response.status == 403) tokenNotValid()
        else if(response.status == 498){
            await refreshToken()
            await getUser()
        }
    }

    /**Show a specific data for modification */
    function show(label){
        showAll.value = false
        showComp.value = label
    }

    const errorModiyDetail = ref(undefined)
    const errorModiyDetailMsg = ref('')

    /**Checks the data fields before sending them to back-end */
    async function checkUpdate(field, value){
        switch(field.toUpperCase()){
            case 'NAME': return checkUpdateNameSurname(field, value)
            case 'SURNAME': return checkUpdateNameSurname(field, value)
            case 'DOB': return checkUpdateBirthday(value)
            case 'GENDER': return true
            case 'RECOVERY_MAIL': return checkUpdateRecoveryMail(value)
            case 'PHONE': return checkUpdatePhone(value)
        }
    }

    /**Checks the user name and surname */
    function checkUpdateNameSurname(field, value){
        if(value == ''){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = field +' is required.'
            return false
        }
        else{
            errorModiyDetail.value = false
            return true
        }
    }

    /**Checks the suer Birthday */
    function checkUpdateBirthday(value){
        if(value.split('-')[0] == 'null' || value.split('-')[1] == 'null' || value.split('-')[2] == 'null'){
                errorModiyDetail.value = true
                errorModiyDetailMsg.value = 'Birthday is required.'
                return false
            }
            else{
                if(!/^\d+$/.test(value.split('-')[0])){
                    errorModiyDetail.value = true
                    errorModiyDetailMsg.value = 'Day is invalid, it must only contain numbers.'
                    return false
                }
                if(!/^\d+$/.test(value.split('-')[2])){
                    errorModiyDetail.value = true
                    errorModiyDetailMsg.value = 'Year is invalid, it must only contain numbers.'
                    return false
                }
                if(parseInt(value.split('-')[2]) < (new Date().getFullYear() - 100) || parseInt(value.split('-')[2]) > new Date().getFullYear()){
                    errorModiyDetail.value = true
                    errorModiyDetailMsg.value = 'Year must be between ' + (new Date().getFullYear() - 100) + ' and ' + new Date().getFullYear() + '.'
                    return false
                }
                if(value.split('-')[1] == 'Febraury'){
                    if(((parseInt(value.split('-')[2]) % 4 == 0) && (parseInt(value.split('-')[2]) % 100 != 0)) || (parseInt(value.split('-')[2]) % 400 == 0)){
                        if(parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days + 1){
                            errorModiyDetail.value = false
                            return true
                        }
                        else{
                            errorModiyDetail.value = true
                            errorModiyDetailMsg.value = 'Day is invalid.'
                            return false
                        }
                    }
                    else if(parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days){
                        errorModiyDetail.value = false
                        return true
                    }
                    else{
                        errorModiyDetail.value = true
                        errorModiyDetailMsg.value = 'Day is invalid.'
                        return false
                    }
                }
                else if(parseInt(value.split('-')[0]) > 0 && parseInt(value.split('-')[0]) <= months.value.find(e => e.month == value.split('-')[1]).days){
                    errorModiyDetail.value = false
                    return true
                }
                else{
                    errorModiyDetail.value = true
                    errorModiyDetailMsg.value = 'Day is invalid.'
                    return false
                }
            }
    }

    /**Checks the recovery mail */
    function checkUpdateRecoveryMail(value){
        var reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if(reg.test(value)){
            errorModiyDetail.value = false
            return true
        }
        else{
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Email not valid'
            return false
        }
    }

    /**Removes the recovery mail */
    async function deleteRecoveryMail(field, value){
        helperUpdate(field, value)
        addRecoveryMail.value = null
    }

    /**Checks the user phone number */
    function checkUpdatePhone(value){
        let code = value.split('-')[0]
        let phone = value.split('-')[1]
        if(code == 'null'){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Insert county code'
            return false
        }
        else if(phone == 'null'){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Insert a phone.'
            return false
        }
        if(!/^\d+$/.test(code)){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'County code is invalid, it must only contain numbers.'
            return false
        }
        else if(code.length <= 0 || code.length > 3){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'County code is invalid'
            return false
        }
        if(!/^\d+$/.test(phone)){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Phone number is invalid, it must only contain numbers.'
            return false
        }
        else if(phone.length != 10){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Phone number is invalid'
            return false
        }
        return true
    }

    /**Removes the phone number */
    async function deletePhone(field, value){
        await helperUpdate(field, value)
        contactInfo.Code = null
        contactInfo.Phone = null
        addPhone.value = null
    }
    
    /**Updates the specified field and its value with check function*/
    async function update(field, value){
        if(!await checkUpdate(field, value)) return
        await helperUpdate(field, value)
    }

    /**Updates the specified field and its value without a check Function */
    async function helperUpdate(field, value){
        const response = await fetch(process.env.VUE_APP_USER + "/details", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body:JSON.stringify({"field":field, "value":value})
        })
        if(response.status == 200){
            lastOP.value = true
            await getUser()
        }
        else if(response.status == 403) tokenNotValid()
        else if(response.status == 498){
            await refreshToken()
            await helperUpdate(field, value)
        }
    }

    /**Checks if password fields are valid */
    function checkPass(oldPass, newPass, confirmPass){
        if(oldPass == null){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Insert old password.'
            return false
        } 
        if(!(/[A-Z]/.test(newPass) && /[a-z]/.test(newPass) && /[0-9]/.test(newPass) && /[#?!@$%^&*-]/.test(newPass) && (newPass.length >= 8 || newPass.length <= 30))){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'New password must contain a lowercase, an uppercase, a number and a symbol. Minimum length is 8 and maximum length is 30.'
            return false
        }
        if(newPass == confirmPass){
            errorModiyDetail.value = false
            return true
        }
        else{
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = 'Passwords do not match.'
            return false
        }
    }

    /**Calls the back-end to change user password */
    async function changePassword(oldPass, newPass, confirmPass){
        if(!checkPass(oldPass, newPass, confirmPass)) return
        const response = await fetch(process.env.VUE_APP_USER + "/password", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body:JSON.stringify({"oldpassword":oldPass, "newpassword":newPass})
        })
        if(response.status == 200){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = "Password Changed"
            lastOP.value = true
            await getUser()
        }
        else if(response.status == 401){
            errorModiyDetail.value = true
            errorModiyDetailMsg.value = "Old password isn't correct"
            lastOP.value = false
            await getUser()
        }
        else if(response.status == 403) tokenNotValid()
        else if(response.status == 498){
            await refreshToken()
            await changePassword(oldPass, newPass, confirmPass)
        }
        contactInfo.OldPassword = null
        contactInfo.NewPasword = null
        contactInfo.ConfirmNewPassword = null
    }

    async function goBack(){
        await getUser()
        showAll.value = true 
        showComp.value = ''
    }
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
    <v-snackbar v-model="errorModiyDetail" timeout="2000">
        {{ errorModiyDetailMsg }}
        <template v-slot:actions>
            <v-btn color="error" variant="text" @click="errorModiyDetail = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>

    <v-container class="mt-16 unselectable">
        <v-row>
            <v-col cols="0" lg="3"></v-col>

            <v-col cols="12" lg="6" v-if="showAll">
                <v-row class="d-flex flex-column">
                    <v-col class="d-flex align-center justify-center">
                        <v-avatar color="blue-darken-4" size="large">
                            <span class="text-h6">
                                {{ basicInfo.Name[0].toUpperCase() + basicInfo.Surname[0].toUpperCase() }}
                            </span>
                        </v-avatar>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                        <div class="text-h4 font-weight-regular">
                            Welcome, {{ basicInfo.Name + ' ' + basicInfo.Surname }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-row class="pa-3">
                            <v-col cols="12" md="6">
                                <div class="text-h5">
                                    Personal info
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <!--Basic Info-->
                    <v-col cols="12">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Basic Info
                                        </div>
                                        <v-row class="my-sm-4 unselectable changePointer popOut" @click="show('Name')">
                                            <v-col cols="3" class="d-flex align-center">
                                                Name
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ basicInfo.Name + ' ' + basicInfo.Surname }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer" @click="show('Birthday')">
                                            <v-col cols="3" class="d-flex align-center">
                                                Birthday
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                <div v-if="basicInfo.Birthday.day != null && basicInfo.Birthday.month != null && basicInfo.Birthday.year != null">
                                                    {{ basicInfo.Birthday.day + '-' + basicInfo.Birthday.month + '-' + basicInfo.Birthday.year }}
                                                </div>
                                                <div v-else>
                                                    Not Set
                                                </div>
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer" @click="show('Gender')">
                                            <v-col cols="3" class="d-flex align-center">
                                                Gender
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ basicInfo.Gender || "Not Set" }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <!--Contact Info-->
                    <v-col cols="12">
                        <v-card class="mx-auto" variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Contact Info
                                        </div>
                                        <v-row class="my-sm-4 unselectable popOut changePointer" @click="show('Email')">
                                            <v-col cols="3" class="d-flex align-center">
                                                Email
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ contactInfo.Email }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer" @click="show('Phone')">
                                            <v-col cols="3" class="d-flex align-center">
                                                Phone
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                <div v-if="contactInfo.Code == null || contactInfo.Phone == null">
                                                    Not Set
                                                </div>
                                                <div v-else>
                                                    {{ '+' + contactInfo.Code + ' ' + contactInfo.Phone }}
                                                </div>
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <!--Password Change-->
                    <v-col cols="12">
                        <v-card class="mx-auto" variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Password
                                        </div>
                                        <div class="text-caption mt-1">
                                            A secure password helps protect your * account
                                        </div>
                                        <v-row class="my-sm-4 unselectable popOut changePointer" @click="show('Password')">
                                            <v-col cols="3" class="d-flex align-center">
                                                <div class="text-subtitle-1 font-weight-bold">**************</div>
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Name'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="2">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Name</div>
                    </v-col>
                    <v-col cols="10"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <v-text-field class="my-sm-4" label="Name" append-icon="mdi-pencil" v-model="basicInfo.Name" 
                                        @click:append="update('name', basicInfo.Name)"/>
                                        <v-text-field label="Surname" append-icon="mdi-pencil" v-model="basicInfo.Surname" 
                                        @click:append="update('surname', basicInfo.Surname)"/>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Birthday'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="2">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Birthday</div>
                    </v-col>
                    <v-col cols="10"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Birthday
                                        </div>
                                        <v-row class="mt-2">
                                            <v-col cols="12" md="4">
                                                <v-select :items="months" item-title="month" item-value="month" v-model="basicInfo.Birthday.month" label="Month"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field label="Day" v-model="basicInfo.Birthday.day"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field label="Year" v-model="basicInfo.Birthday.year"></v-text-field>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="showAll = true, showComp = ''">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" 
                                    @click="update('dob', basicInfo.Birthday.day + '-' + basicInfo.Birthday.month + '-' + basicInfo.Birthday.year)">
                                    Add
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Gender'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="2">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Gender</div>
                    </v-col>
                    <v-col cols="10"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Gender
                                        </div>
                                        <v-row class="mt-2">
                                            <v-col cols="12">
                                                <v-radio-group v-model="basicInfo.Gender">
                                                    <v-radio :color="color" label="Male" value="Male" @click="update('gender', 'Male')"></v-radio>
                                                    <v-radio :color="color" label="Female" value="Female" @click="update('gender', 'Female')"></v-radio>
                                                    <v-radio :color="color" label="Rather not say" :value="null" @click="update('gender', null)"></v-radio>
                                                </v-radio-group>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Email'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="2">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Email</div>
                    </v-col>
                    <v-col cols="10"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h4 mt-1">
                                            * Account email
                                        </div>
                                        <div class="text-subtitle-2 mt-2">
                                            The address used to identify your * Account to you and others. You can't change this address.
                                        </div>
                                        <v-divider thickness="1" class="border-opacity-100 mt-5"></v-divider>
                                        <div class="text-subtitle-2 font-weight-bold my-2">
                                            {{ contactInfo.Email }}
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
                <v-row>
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h4 mt-1">
                                            Recovery Email
                                        </div>
                                        <div class="text-subtitle-2 mt-2">
                                            The address where * can contact you if there's unusual activity in your account or if you get locked out.
                                        </div>
                                        <v-divider thickness="1" class="border-opacity-100 mt-5"></v-divider>
                                        <div class="text-subtitle-2 font-weight-bold my-2 d-flex justify-space-between align-center"
                                            v-if="contactInfo.RecoveryEmail != null">
                                                {{ contactInfo.RecoveryEmail || 'Not Set' }}
                                                <v-icon icon="mdi-delete" :color="color" @click="deleteRecoveryMail('recovery_mail', null)"></v-icon>    
                                        </div>
                                        <div v-else>
                                            <div class="text-h6 font-weight-bold my-2">
                                                Add a recovery email
                                            </div>
                                            <v-text-field class="my-sm-4" label="Recovery Mail" append-icon="mdi-pencil" v-model="addRecoveryMail" 
                                            @click:append="update('recovery_mail', addRecoveryMail)" prepend-icon="mdi-email"/>
                                        </div>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Phone'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="3">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Phone Number</div>
                    </v-col>
                    <v-col cols="9"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3 mt-2" v-if="contactInfo.Phone == null || contactInfo.Code == null">
                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="12">
                                                <div class="text-h6">
                                                    Add a Phone Number
                                                </div>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="2">
                                                <v-text-field prepend-icon="mdi-plus" v-model="contactInfo.Code"/>
                                            </v-col>
                                            <v-col cols="8">
                                                <v-text-field v-model="addPhone"></v-text-field>
                                            </v-col>
                                            <v-col cols="2">
                                                <v-btn color="blue-darken-1" variant="text" @click="update('phone', contactInfo.Code + '-' + addPhone )">
                                                    Add
                                                </v-btn>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row class="pa-3 mt-2" v-else>
                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="12">
                                                <div class="text-h6">
                                                    This phone number has been added to your * Account
                                                </div>
                                                <div class="text-subtitle-2 mt-2">
                                                    Update your phone number
                                                </div>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col cols="2">
                                                <v-text-field class="my-sm-4" label="Code" prepend-inner-icon="mdi-plus" v-model="contactInfo.Code"/>
                                            </v-col>
                                            <v-col cols="10">
                                                <v-text-field class="my-sm-4" label="Phone" append-inner-icon="mdi-pencil" v-model="contactInfo.Phone" 
                                                    @click:append-inner="update('phone', contactInfo.Code + '-' + contactInfo.Phone )"
                                                    append-icon="mdi-delete" @click:append="deletePhone('phone', null)"/>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="12" lg="6" v-if="showComp == 'Password'">
                <v-row>
                    <v-col class="d-flex align-center justify-space-around" cols="2">
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
                        <div class="text-h5">Password</div>
                    </v-col>
                    <v-col cols="10"></v-col>
                    <v-divider></v-divider>
                </v-row>
                <v-row class="mt-16">
                    <div class="text-h6">
                        Choose a strong password and don't reuse it for other accounts.
                    </div>
                </v-row>
                <v-row class="mt-8">
                    <v-col cols="1"></v-col>
                    <v-col cols="10">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <v-text-field :type="showHideOldPass ? 'text' : 'password'" label="Old Password" 
                                        :append-inner-icon="showHideOldPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append-inner="showHideOldPass = !showHideOldPass"
                                        v-model="contactInfo.OldPassword"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <div class="text-subtitle-2">
                                            Password strength:
                                        </div>
                                        <div class="text-subtitle-2">
                                            Use at least 8 characters. Don't use a password from another site, or something too obvious
                                        </div>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field :type="showHideNewPass ? 'text' : 'password'" label="New Password" 
                                        :append-inner-icon="showHideNewPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append-inner="showHideNewPass = !showHideNewPass"
                                        v-model="contactInfo.NewPasword"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field :type="showHideNewConfimPass ? 'text' : 'password'" label="Confirm Password" 
                                        :append-inner-icon="showHideNewConfimPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append-inner="showHideNewConfimPass = !showHideNewConfimPass"
                                        v-model="contactInfo.ConfirmNewPassword"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="goBack()">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="changePassword(contactInfo.OldPassword, 
                                    contactInfo.NewPasword, contactInfo.ConfirmNewPassword)">
                                    Change
                                </v-btn>
                            </v-card-actions>
                        </v-card>
                    </v-col>
                    <v-col cols="1"></v-col>
                </v-row>
            </v-col>

            <v-col cols="0" lg="3"></v-col>
        </v-row>
    </v-container>
</template>

<style scoped> 

 .changePointer {
     cursor: pointer;
 }

 .unselectable {
     -webkit-touch-callout: none;
     -webkit-user-select: none;
     -khtml-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
 }

 .popOut {
     transition: 0.15s;
 }

 .popOut:hover {
     color: #2196f3;
     transform: scale(1.02);
 }
</style>