<script setup>
    import { update } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import { reactive, computed } from 'vue'
    import { useStore } from 'vuex';
    import ProfileGoBack from './ProfileGoBack.vue';

    /**used to access store to exchange data between different pages */
    const store = useStore()

    /**basic info containing only gender */
    const basicInfo = reactive({
        Gender: computed(() => store.getters.getBasicInfoGender).value
    })

    const color = "#2196f3"    
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
                            <div class="text-h6 mt-1">
                                Gender
                            </div>
                            <v-row class="mt-2">
                                <v-col cols="12">
                                    <v-radio-group v-model="basicInfo.Gender">
                                        <v-radio :color="color" label="Male" value="Male"
                                            @click="update('gender', 'Male')"></v-radio>
                                        <v-radio :color="color" label="Female" value="Female"
                                            @click="update('gender', 'Female')"></v-radio>
                                        <v-radio :color="color" label="Rather not say" :value="null"
                                            @click="update('gender', null)"></v-radio>
                                    </v-radio-group>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="1"></v-col>
</v-row></template>