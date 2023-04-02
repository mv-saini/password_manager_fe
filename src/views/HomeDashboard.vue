<script setup>
    import { ref, watch } from 'vue';
    import AppLogo from '@/components/AppLogo.vue';
    var tab = ref(null)
    var length = ref(0)

    watch(length, (val) => {
        tab.value = val
    })
    
</script>

<template>
    <AppLogo class="mt-16"/>
    <v-container>
        <v-row>
            <v-col cols="2"/>
            <v-col cols="8">
                <v-card>
                    <v-toolbar color="primary">
                        <v-toolbar-title>Dashboard</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="length++">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn icon>
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </v-toolbar>
                    
                    <div class="d-flex flex-row">
                        <v-tabs v-model="tab" direction="vertical" color="primary">
                            <v-tab
                            v-for="n in length"
                            :key="n"
                            :value="n">
                                Item {{ n }}
                            </v-tab>
                        </v-tabs>

                        <v-window v-model="tab">
                            <v-window-item
                            v-for="n in length"
                            :key="n"
                            :value="n">
                                <v-card flat>
                                    <v-card-text>
                                        <p>
                                            option {{ n }}
                                        </p>
                                    </v-card-text>
                                </v-card>
                            </v-window-item>
                        </v-window>
                    </div>
                </v-card>
            </v-col>
            <v-col cols="2"/>
        </v-row>
    </v-container>

  </template>