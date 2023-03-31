<script setup>
import router from '@/router';
  import AppLogo from '@/components/AppLogo.vue';
  import { reactive } from 'vue';
  const data = reactive({
    name: '',
    surname: '',
    email: '',
    password: ''
  });

  async function submit(){
    await fetch('http://localhost:3000/api/register',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    router.push({
        name: 'login'
    });
  }
</script>
<template>

    <AppLogo class="mt-16"/>

    <v-form @submit.prevent="submit" class="mt-8">
        <v-container>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="2">
                    <v-text-field v-model="data.name" type="text" label="Name"></v-text-field>
                </v-col>
                <v-col cols="2">
                    <v-text-field v-model="data.surname" type="text" label="Surname"></v-text-field>
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4">
                    <v-text-field v-model="data.email" type="text" label="Email address"></v-text-field>
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                 <v-col cols="4">
                    <v-text-field v-model="data.password" type="password" label="Password"></v-text-field> 
                </v-col>
                <v-col cols="4"/>
            </v-row>

            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <v-btn type="submit" variant="outlined">
                        Register
                    </v-btn>
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <div class="pb-1 text-caption text-center font-italic font-weight-thick">
                        Already have an account?
                        <router-link :to="{ name: 'login'}">
                            Log in.
                        </router-link>
                    </div>
                </v-col>
                <v-col cols="4"/>
            </v-row>
        </v-container>
    </v-form>
  </template>