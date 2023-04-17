<script setup>
    import { ref, watch, computed } from 'vue';
    import { useStore } from 'vuex';
    //import PasswordGeneratorTool from '@/components/PasswordGeneratorTool.vue';

    const store = useStore()
    const lastOP = ref(false)
    const toolList = ref([
        {
            'title': 'Password Generator',
        },
        {
            'title': 'a',
        },
    ])

    function displayTool(index){
        alert(toolList.value.at(index).title)
    }

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1000);
    })
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="computed(() => store.getters.getLoadingColor).value" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>

    <v-container class="mt-16">
        <v-row>
            <v-col cols="2"></v-col>
            <v-col cols="2">
                <div class="d-flex text-h3 font-weight-light align-center justify-center">
                    Tools
                </div>
                <v-divider thickness="1" class="border-opacity-100"></v-divider>
            </v-col>
            <v-col cols="6">
                <div class="d-flex text-h3 font-weight-light align-center justify-center">
                    -
                </div>
                <v-divider thickness="1" class="border-opacity-100"></v-divider>
            </v-col>
            <v-col cols="2"></v-col>
        </v-row>
        <v-row >
            <v-col cols="2"></v-col>
            <v-col cols="2">
                <v-row class="d-flex align-center justify-center" v-for="(tools, index) in toolList" :key="index">
                    <v-col cols="auto">
                        <div @click="displayTool(index)" class="d-flex text-h6 font-weight-light align-center justify-center">
                            {{ tools.title }}
                        </div>
                    </v-col>
                    <v-divider thickness="1" class="border-opacity-100"></v-divider>
                </v-row>
            </v-col>
            <v-col cols="6">

            </v-col>
            <v-col cols="2"></v-col>
        </v-row>
    </v-container>
</template>