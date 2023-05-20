<script setup>
    import { update, helperUpdate } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import { reactive, computed, ref } from 'vue'
    import { useStore } from 'vuex';
    import ProfileGoBack from './ProfileGoBack.vue';

    const store = useStore()

    const contactInfo = reactive({
        Phone: computed(() => store.getters.getContactInfoPhone).value,
        Code: computed(() => store.getters.getContactInfoCode).value,
    }) 
    const addPhone = ref(null)

    /**Removes the phone number */
    async function deletePhone(field, value) {
        await helperUpdate(field, value)
        contactInfo.Code = null
        contactInfo.Phone = null
    }
</script>

<template>
    <ProfileGoBack/>
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
                                <v-col cols="3">
                                    <v-text-field prepend-icon="mdi-plus" v-model="contactInfo.Code" />
                                </v-col>
                                <v-col cols="7">
                                    <v-text-field v-model="addPhone"></v-text-field>
                                </v-col>
                                <v-col cols="2">
                                    <v-btn color="blue-darken-1" variant="text"
                                        @click="update('phone', contactInfo.Code + '-' + addPhone)">
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
                                    <v-text-field class="my-sm-4" label="Code" prepend-inner-icon="mdi-plus"
                                        v-model="contactInfo.Code" />
                                </v-col>
                                <v-col cols="10">
                                    <v-text-field class="my-sm-4" label="Phone" append-inner-icon="mdi-pencil"
                                        v-model="contactInfo.Phone"
                                        @click:append-inner="update('phone', contactInfo.Code + '-' + contactInfo.Phone)"
                                        append-icon="mdi-delete" @click:append="deletePhone('phone', null)" />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="1"></v-col>
</v-row></template>