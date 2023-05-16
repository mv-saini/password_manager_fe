<script setup>
  import router from '@/router';
  import { reactive, ref } from 'vue';
  import { useStore } from 'vuex'
  
  const store = useStore()
  const check = ref(false)
  const msg = ref('')
  const showHidePass = ref(false)
  const data = reactive({
    email: '',
    password: ''
  }); 

  /**Checks the data before sending it to the back-end */
  async function checkSubmit(){
    if(data.email == '' || data.password == ''){
        check.value = true
        msg.value = 'Email and Password is empty'
    }
    else{
        await submit()
    }
  }

  /**Calls the back-end to log the user in if email and password is correct */
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
        store.dispatch('access_token', resData.accessToken)
        store.dispatch('refresh_token', resData.refreshToken)
        store.dispatch('change_auth', true)
        store.dispatch('set_user', resData.email)
        store.dispatch('set_user_name', resData.name)
        store.dispatch('set_user_surname', resData.surname)
        router.push({
            path: new URLSearchParams(window.location.search).get('redirect')  || '/dashboard'
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
    <v-container class="mt-16">
        <v-row>
            <v-col cols="0" md="4"/>
            <v-col cols="12" md="4" class="d-flex align-center justify-center">
                 <div class="text-h4">
                    Login
                 </div>
            </v-col>
            <v-col cols="0" md="4"/>
        </v-row>
    </v-container>

    <v-container v-if="check">
        <v-row>
            <v-col cols="0" md="4"/>
            <v-col cols="12" md="4">
                 <v-alert type="error" title='Check your credentials.'>
                 {{ msg }}
                </v-alert>
            </v-col>
            <v-col cols="0" md="4"/>
        </v-row>
    </v-container>

    <v-form  @submit.prevent="checkSubmit">
        <v-container>
            <v-row>
                <v-col cols="2" lg="4"/>
                <v-col cols="8" lg="4">
                    <v-text-field type="text" v-model="data.email" label="Email address" required clearable/> 
                </v-col>
                <v-col cols="2" lg="4"/>
            </v-row>
            <v-row>
                <v-col cols="2" lg="4"/>
                <v-col cols="8" lg="4">
                    <v-text-field v-model="data.password" label="Password" required clearable :type="showHidePass ? 'text' : 'password'"
                    :append-inner-icon="showHidePass ? 'mdi-eye' : 'mdi-eye-off'" @click:append-inner="showHidePass = !showHidePass"/> 
                </v-col>
                <v-col cols="2" lg="4"/>
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
                <v-col cols="1" md="4"/>
                <v-col cols="10" md="4" class="text-center">
                    <div class="pb-1 text-caption text-center font-italic font-weight-thick">
                        Don't have an account?
                        <router-link :to="{ name: 'register'}">
                            Create an account.
                        </router-link>
                    </div>
                </v-col>
                <v-col cols="1" md="4"/>
            </v-row>
        </v-container>
    </v-form>
  </template>

  