<script setup>
    import { changePassword, goBack } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import { reactive, ref } from 'vue'
    import ProfileGoBack from './ProfileGoBack.vue';

    /**contact info containing only password */
    const contactInfo = reactive({
        OldPassword: null,
        NewPasword: null,
        ConfirmNewPassword: null
    })

    /**to show and hide old password fro text field */
    const showHideOldPass = ref(false)

    /**to show and hide new password from text field */
    const showHideNewPass = ref(false)

    /**to show and hide new password confirmation from text field */
    const showHideNewConfimPass = ref(false)

    /**nullifies all the properties inside contact info after calling backend*/
    async function preChangePassword(oldPass, newPass, confirmPass){
        await changePassword(oldPass, newPass, confirmPass)
        contactInfo.OldPassword = null
        contactInfo.NewPasword = null
        contactInfo.ConfirmNewPassword = null
    }
</script>

<template>
    <ProfileGoBack />
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
                                v-model="contactInfo.OldPassword" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <div class="text-subtitle-2">
                                Password strength:
                            </div>
                            <div class="text-subtitle-2">
                                Use at least 8 characters, a number, an uppercase, a lowercase and a symbol.
                            </div>
                            <div class="text-subtitle-2">
                                Don't use a password from another site, or something too obvious.
                            </div>
                            
                        </v-col>
                        <v-col cols="12">
                            <v-text-field :type="showHideNewPass ? 'text' : 'password'" label="New Password"
                                :append-inner-icon="showHideNewPass ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append-inner="showHideNewPass = !showHideNewPass"
                                v-model="contactInfo.NewPasword" clearable></v-text-field>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field :type="showHideNewConfimPass ? 'text' : 'password'" label="Confirm Password"
                                :append-inner-icon="showHideNewConfimPass ? 'mdi-eye' : 'mdi-eye-off'"
                                @click:append-inner="showHideNewConfimPass = !showHideNewConfimPass"
                                v-model="contactInfo.ConfirmNewPassword" clearable></v-text-field>
                        </v-col>
                    </v-row>
                </v-card-item>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue-darken-1" variant="text" @click="goBack()">
                        Cancel
                    </v-btn>
                    <v-btn color="blue-darken-1" variant="text" @click="preChangePassword(contactInfo.OldPassword,
                        contactInfo.NewPasword, contactInfo.ConfirmNewPassword)">
                        Change
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-col>
        <v-col cols="1"></v-col>
    </v-row>
</template>