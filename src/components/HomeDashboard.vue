<script setup>
    import { ref, watch } from 'vue';
    import AppLogo from '@/components/AppLogo.vue';
    var tab = ref(null)
    var tabH = ref(null)
    var length = ref(0)
    var lengthH = ref(0)

    watch(length, (val) => {
        tab.value = val
    })

    watch(lengthH, (valH) => {
        tabH.value = valH
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

    <v-container>
        <v-row>
            <v-col cols="2"/>
            <v-col cols="8">
                <v-toolbar color="primary">
                        <v-toolbar-title>Dashboard</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-btn icon @click="lengthH++">
                            <v-icon>mdi-plus</v-icon>
                        </v-btn>
                        <v-btn icon>
                            <v-icon>mdi-dots-vertical</v-icon>
                        </v-btn>
                    </v-toolbar>
                <v-card>
                    <v-tabs
                    v-model="tabH"
                    bg-color="teal-darken-3"
                    show-arrows
                    slider-color="teal-lighten-3"
                    >
                    <v-tab
                        v-for="i in lengthH"
                        :key="i"
                        :value="'tab-' + i"
                    >
                        Item {{ i }}
                    </v-tab>
                    </v-tabs>
                </v-card>

                <v-card-text>
                    <v-window v-model="tabH">
                            <v-window-item
                            v-for="i in lengthH"
                        :key="i"
                        :value="'tab-' + i">
                                <v-card flat>
                                    <v-card-text>
                                        <p>
                                            Item text {{ i }}
                                        </p>
                                    </v-card-text>
                                </v-card>
                            </v-window-item>
                        </v-window>
                </v-card-text>
            </v-col>
            <v-col cols="2"/>
        </v-row>
    </v-container>

  </template>