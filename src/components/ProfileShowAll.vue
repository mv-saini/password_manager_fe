<script setup>
    import { computed, reactive, onMounted } from 'vue';
    import { useStore } from 'vuex';

    const store = useStore()

    const basicInfo = reactive({
        Name: computed(() => store.getters.getUserName).value,
        Surname: computed(() => store.getters.getUserSurname).value,
        Birthday: {
            month: null,
            day: null, 
            year: null,
        },
        Gender: null,
    })

    const contactInfo = reactive({
        Email: computed(() => store.getters.getUser).value,
        RecoveryEmail: null,
        Phone: null,
        Code: null,
    })

    onMounted(() => {
        setTimeout(() => {
            basicInfo.Name = computed(() => store.getters.getUserName).value
            basicInfo.Surname = computed(() => store.getters.getUserSurname).value
            basicInfo.Birthday.month = computed(() => store.getters.getBasicInfoBirthday).value.month
            basicInfo.Birthday.day = computed(() => store.getters.getBasicInfoBirthday).value.day
            basicInfo.Birthday.year = computed(() => store.getters.getBasicInfoBirthday).value.year
            basicInfo.Gender = computed(() => store.getters.getBasicInfoGender).value
            contactInfo.RecoveryEmail = computed(() => store.getters.getContactInfoRecoveryEmail).value
            contactInfo.Phone = computed(() => store.getters.getContactInfoPhone).value
            contactInfo.Code = computed(() => store.getters.getContactInfoCode).value
        }, 100);
        
    })

    function show(comp){
        store.dispatch('set_show_comp', comp)
        store.dispatch('set_comp_title', comp)
    }

    
</script>

<template>
    <v-row>
        
        <v-col class="d-flex align-center justify-center" cols="12">
            <v-avatar color="blue-darken-4" size="large">
                <span class="text-h6">
                    {{ basicInfo.Name[0].toUpperCase() + basicInfo.Surname[0].toUpperCase() }}
                </span>
            </v-avatar>
        </v-col>

        <v-col class="d-flex align-center justify-center" cols="12">
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
                                    <div
                                        v-if="basicInfo.Birthday.day != null && basicInfo.Birthday.month != null && basicInfo.Birthday.year != null">
                                        {{ basicInfo.Birthday.day + ' - ' + basicInfo.Birthday.month + ' - ' +
                                            basicInfo.Birthday.year }}
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
</template>