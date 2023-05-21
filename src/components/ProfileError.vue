<script setup>
    import { useStore } from 'vuex'
    import { computed } from 'vue'

    /**used to access store to exchange data between different pages */
    const store = useStore()

    /**if theres an error */
    const errorModifyDetail = computed(() => store.getters.getErrorModifyDetail)

    /**contains the error message */
    const errorModifyDetailMsg = computed(() => store.getters.getErrorModifyDetailMsg)

    /**closes the error box */
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