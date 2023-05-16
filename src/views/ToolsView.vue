<script setup>
    import { ref, watch, computed, onMounted } from 'vue';
    import { useStore } from 'vuex';
    import PasswordGeneratorTool from '@/components/PasswordGeneratorTool.vue';

    const store = useStore()
    const lastOP = ref(false)
    const toolList = ref([
        {
            'title': 'Password Generator',
        },
    ])
    const selectedTool = ref(toolList.value.at(0).title)

    onMounted(() => {
        lastOP.value = true
    })

    /**Display a specific tool */
    function displayTool(index){
        selectedTool.value = toolList.value.at(index).title
        lastOP.value = true
    }

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1200);
    })
    
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="computed(() => store.getters.getLoadingColor).value" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>

    <v-container class="mt-16 unselectable">
        <v-container>
            <v-row>
                <v-col cols="0" md="2"/>

                <v-col cols="3" md="2">
                    <v-row>
                        <v-col cols="12">
                            <div rounded class="pa-xl-6 mx-auto" max-width="400">
                                <div class="px-xl-2 text-h6 font-weight-bold">
                                    Tools
                                    <v-divider thickness="1"></v-divider>
                                </div>
                                <div class="px-xl-2 text-subtitle-1 font-weight-light">
                                    <div class="pl-xl-6 popOut changePointer" v-for="(tool, index) in toolList" :key="index">
                                        <div v-if="selectedTool == tool.title" style="color: #2196f3" @click="displayTool(index)">
                                            {{ tool.title }}
                                        </div>
                                        <div v-else @click="displayTool(index)">
                                            {{ tool.title }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="9" md="6">
                    <v-row>
                        <v-col cols="12" class="d-flex align-center justify-center">
                            <PasswordGeneratorTool v-if="selectedTool == 'Password Generator'"/>
                        </v-col>
                    </v-row>
                </v-col>

                <v-col cols="0" md="2"/>
            </v-row>
        </v-container>
    </v-container>
</template>

<style scoped> 
.changePointer {
     cursor: pointer;
 }

 .unselectable {
     -webkit-touch-callout: none;
     -webkit-user-select: none;
     -khtml-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
 }

 .popOut {
     transition: 0.15s;
 }

 .popOut:hover {
     color: #2196f3;
     transform: scale(1.02);
 }
</style>