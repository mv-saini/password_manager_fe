<script setup>
    import { update, goBack, months } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import { reactive, computed } from 'vue'
    import { useStore } from 'vuex';
    import ProfileGoBack from './ProfileGoBack.vue';

    /**used to access store to exchange data between different pages */
    const store = useStore()

    /**basicInfo containing Birthday details */
    const basicInfo = reactive({
        Birthday: {
            month: computed(() => store.getters.getBasicInfoBirthday).value.month,
            day: computed(() => store.getters.getBasicInfoBirthday).value.day, 
            year: computed(() => store.getters.getBasicInfoBirthday).value.year,
        },
    })
</script>

<template>
    <ProfileGoBack/>
    {{ basicInfo.day }}
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
                                    <v-select :items="months" item-title="month" item-value="month"
                                        v-model="basicInfo.Birthday.month" label="Month"></v-select>
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
                    <v-btn color="blue-darken-1" variant="text" @click="goBack()">
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
</template>