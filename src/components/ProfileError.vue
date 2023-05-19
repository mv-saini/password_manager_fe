<script setup>
    import { useStore } from 'vuex'
    import { computed } from 'vue'

    const store = useStore()

    const errorModifyDetail = computed(() => store.getters.getErrorModifyDetail)
    const errorModifyDetailMsg = computed(() => store.getters.getErrorModifyDetailMsg)

    function close(){
        store.dispatch('change_error_modify_detail', !errorModifyDetail.value)
    }
</script>

<template>
    <v-snackbar v-model="errorModifyDetail" timeout="2000">
        {{ errorModifyDetailMsg }}
        <template v-slot:actions>
            <v-btn color="error" variant="text" @click="close()">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>