<script setup>
    import { goBack } from '@/SharedJS/ProfileJS/ProfileUpdateJS'
    import { useStore } from 'vuex'
    import { computed } from 'vue'

    /**used to access store to exchange data between different pages */
    const store = useStore()
</script>

<template>
    <v-row>
        <v-col class="d-flex align-center justify-left" cols="12" sm="2">
            <v-icon class="popOut" icon="mdi-arrow-left" @click="goBack()"></v-icon>
            <div class="text-h5">{{ computed(() => store.getters.getCompTitle).value }}</div>
        </v-col>
        <v-col cols="0" sm="10"></v-col>
        <v-divider></v-divider>
    </v-row>
</template>