<script setup>
    import { update, helperUpdate } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import { reactive, computed, ref } from 'vue'
    import { useStore } from 'vuex';
    import ProfileGoBack from './ProfileGoBack.vue';

    /**used to access store to exchange data between different pages */
    const store = useStore()

    /**contactInfo containing recovery email */
    const contactInfo = reactive({
        Email: computed(() => store.getters.getUser).value,
        RecoveryEmail: computed(() => store.getters.getContactInfoRecoveryEmail).value,
    })

    /**color of btn */
    const color = "#2196f3" 
    
    /**to add the recovery mail */
    const addRecoveryMail = ref(null)

    /**Removes the recovery mail */
    async function deleteRecoveryMail(field, value) {
        helperUpdate(field, value)
    }
</script>

<template>
    <ProfileGoBack/>
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
                                The address used to identify your * Account to you and others. You can't change this
                                address.
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
                                The address where * can contact you if there's unusual activity in your account or if you
                                get locked out.
                            </div>
                            <v-divider thickness="1" class="border-opacity-100 mt-5"></v-divider>
                            <div class="text-subtitle-2 font-weight-bold my-2 d-flex justify-space-between align-center"
                                v-if="contactInfo.RecoveryEmail != null">
                                {{ contactInfo.RecoveryEmail || 'Not Set' }}
                                <v-icon icon="mdi-delete" :color="color"
                                    @click="deleteRecoveryMail('recovery_mail', null)"></v-icon>
                            </div>
                            <div v-else>
                                <div class="text-h6 font-weight-bold my-2">
                                    Add a recovery email
                                </div>
                                <v-text-field class="my-sm-4" label="Recovery Mail" append-icon="mdi-pencil"
                                    v-model="addRecoveryMail" @click:append="update('recovery_mail', addRecoveryMail)"
                                    prepend-icon="mdi-email" />
                            </div>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="1"></v-col>
</v-row></template>