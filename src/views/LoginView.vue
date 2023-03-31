<script setup>
  import AppLogo from '@/components/AppLogo.vue';
  import router from '@/router';
  import { reactive } from 'vue';
  const data = reactive({
    email: '',
    password: ''
  });
  async function submit(){
    const res = await fetch('http://localhost:3000/api/login',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include',
        body: JSON.stringify(data)
    })
    if(res.status == 200){
        router.push({
            name: 'home'
        })
    }
    else{
        data.email = ''
        data.password = ''
    }
  }
</script>


<template>
    <AppLogo class="mt-16"/>
    <v-form @submit.prevent="submit" class="mt-8">
        <v-container>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4">
                    <v-text-field type="text" v-model="data.email" label="Email address" required/> 
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4">
                    <v-text-field type="password" v-model="data.password" label="Password" required/> 
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <v-btn type="submit" variant="outlined">
                        Login
                    </v-btn>
                </v-col>
                <v-col cols="4"/>
            </v-row>
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <div class="pb-1 text-caption text-center font-italic font-weight-thick">
                        Don't have an account?
                        <router-link :to="{ name: 'register'}">
                            Create an account.
                        </router-link>
                    </div>
                </v-col>
                <v-col cols="4"/>
            </v-row>
        </v-container>
    </v-form>
  </template>

  