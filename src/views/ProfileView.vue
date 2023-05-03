<script setup>
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
            month: undefined,
            day: undefined, 
            year: undefined
        },
        Gender: undefined,
    })

    const months = ref([
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ])

    const addRecoveryMail = ref(null)
    const addPhone = ref(null)

    const contactInfo = reactive({
        Email: computed(() => store.getters.getUser).value,
        RecoveryEmail: undefined,
        Phone: undefined,
        Code: undefined,
        OldPassword: undefined,
        NewPasword: undefined
    })

    onMounted(async () => {
        if (computed(() => store.getters.getAuth).value) {
            await getUser()
        }
    })

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1200);
    })

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
            /*basicInfo.Birthday.day = resData.user.dob.split('-')[0]
            basicInfo.Birthday.month = resData.user.dob.split('-')[1]
            basicInfo.Birthday.year = resData.user.dob.split('-')[2]
            basicInfo.Gender = resData.user.gender
            contactInfo.RecoveryEmail = resData.user.recovery_mail
            contactInfo.Phone = resData.user.phone

            contactInfo.Code = contactInfo.Phone[0] + '' + contactInfo.Phone[1]
            contactInfo.Phone = contactInfo.Phone.slice(2)*/
        }
    }

    function show(label){
        showAll.value = false
        showComp.value = label
    }

    const errName = ref(undefined)

    async function checkUpdate(field, value){
        if(field.toUpperCase() == 'NAME'){
            if(value == ''){
                errName.value = true
                return false
            }
            else{
                errName.value = false
                return true
            }
        }

        if(field.toUpperCase() == 'SURNAME'){
            if(value == '')
                return false
            else
                return true
        }
    }

    async function update(field, value){
        if(!await checkUpdate(field, value)) return
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
    }
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
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
                                                {{ basicInfo.Birthday.day + '-' + basicInfo.Birthday.month + '-' + basicInfo.Birthday.year || "Not Set" }}
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
                                                <div v-if="contactInfo.Code == undefined || contactInfo.Phone == undefined">
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                <v-snackbar v-model="errName" timeout="2000">
                                    <template v-slot:actions>
                                        <v-btn color="error" variant="text" @click="errName = false">
                                            containsLowercase
                                        </v-btn>
                                    </template>
                                </v-snackbar>
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                                <v-select :items="months" v-model="basicInfo.Birthday.month" label="Month"></v-select>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field label="Day" type="text" v-model="basicInfo.Birthday.day"></v-text-field>
                                            </v-col>
                                            <v-col cols="12" md="4">
                                                <v-text-field label="Year" type="text" v-model="basicInfo.Birthday.year"></v-text-field>
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                                    <v-radio :color="color" label="Rather not say" value="Not Set" @click="update('gender', 'Not Set')"></v-radio>
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                            v-if="contactInfo.RecoveryEmail != undefined && contactInfo.RecoveryEmail.trim() != ''">
                                                {{ contactInfo.RecoveryEmail || 'Not Set' }}
                                                <v-icon icon="mdi-delete" :color="color" @click="update('recovery_mail', '')"></v-icon>    
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                <v-row class="pa-3 mt-2" v-if="contactInfo.Phone == undefined">
                                    <v-col cols="12">
                                        <v-row>
                                            <v-col cols="12">
                                                <div class="text-h6">
                                                    Add a Phone Number
                                                </div>
                                            </v-col>
                                        </v-row>
                                        <v-row class="d-flex align-center justify-center" >
                                            <v-col cols="2">
                                                <v-text-field prepend-icon="mdi-plus" v-model="contactInfo.Code"/>
                                            </v-col>
                                            <v-col cols="8">
                                                <v-text-field v-model="addPhone"></v-text-field>
                                            </v-col>
                                            <v-col cols="2">
                                                <v-btn color="blue-darken-1" variant="text" @click="update('phone', contactInfo.Code + '' + contactInfo.Phone )">
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
                                                    @click:append-inner="update('phone', contactInfo.Code + '' + contactInfo.Phone )"
                                                    append-icon="mdi-delete" @click:append="update('phone', undefined)"/>
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
                        <v-icon class="popOut" icon="mdi-arrow-left" @click="showAll = true, showComp = ''"></v-icon>
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
                                        @click:append-inner="showHideOldPass = !showHideOldPass"></v-text-field>
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
                                        @click:append-inner="showHideNewPass = !showHideNewPass"></v-text-field>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field :type="showHideNewConfimPass ? 'text' : 'password'" label="Confirm Password" 
                                        :append-inner-icon="showHideNewConfimPass ? 'mdi-eye' : 'mdi-eye-off'"
                                        @click:append-inner="showHideNewConfimPass = !showHideNewConfimPass"></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                            <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn color="blue-darken-1" variant="text" @click="showAll = true, showComp = ''">
                                    Cancel
                                </v-btn>
                                <v-btn color="blue-darken-1" variant="text" @click="update('password')">
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