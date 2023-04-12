<script setup>
  import router from '@/router';
  import { reactive, ref } from 'vue';
  import { useStore } from 'vuex'
  
  const store = useStore()
  var check = ref(false)
  var msg = ref('')
  const data = reactive({
    email: '',
    password: ''
  }); 

  async function checkSubmit(){
    if(data.email == '' || data.password == ''){
        check.value = true
        msg.value = 'Email and Password is empty'
    }
    else{
        await submit()
    }
  }

  async function submit(){
    const response = await fetch(process.env.VUE_APP_LOGIN,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    })
    if(response.status == 200){
        const resData = await response.json()
        store.dispatch('set_user', resData.email)
        store.dispatch('access_token', resData.accessToken)
        store.dispatch('change_auth', true)
        window.$cookies.set('logged', true, '15MIN')
        router.push({
            name: 'dashboard'
        })
    }
    else if(response.status == 401){
        check.value = true
        msg.value = 'Incorrect password'
    }
    else{
        check.value = true
        msg.value = 'Email not found'
    }
  }
</script>


<template>
    <v-container v-if="check" class="mt-8">
        <v-row>
            <v-col cols="4"/>
            <v-col cols="4">
                 <v-alert
                 type="error" title='Check your credentials.'>
                 {{ msg }}
                </v-alert>
            </v-col>
            <v-col cols="4"/>
        </v-row>
    </v-container>

    <v-form class="mt-16 pt-16" @submit.prevent="checkSubmit">
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

  