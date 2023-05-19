<script setup>
    import { computed, reactive } from 'vue'
    import { useStore } from 'vuex';
    import { update } from '@/SharedJS/ProfileJS/ProfileUpdateJS';
    import ProfileGoBack from './ProfileGoBack.vue';

    const store = useStore()

    const basicInfo = reactive({
        Name: computed(() => store.getters.getUserName).value,
        Surname: computed(() => store.getters.getUserSurname).value,
    })
    
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
                            <v-text-field class="my-sm-4" label="Name" append-icon="mdi-pencil" v-model="basicInfo.Name"
                                @click:append="update('name', basicInfo.Name)" />
                            <v-text-field label="Surname" append-icon="mdi-pencil" v-model="basicInfo.Surname"
                                @click:append="update('surname', basicInfo.Surname)" />
                        </v-col>
                    </v-row>
                </v-card-item>
            </v-card>
        </v-col>
        <v-col cols="1"></v-col>
    </v-row>
</template>