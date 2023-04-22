<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
  import { useTheme } from "vuetify";
  import router from '@/router';

  const store = useStore()
  const theme = useTheme()
  const log = computed(() => store.getters.getAuth)
  theme.global.name.value = computed(() => store.getters.getTheme).value

  function toggleTheme(){
    store.dispatch('is_dark', !computed(() => store.getters.getDarkMode).value)
    theme.global.name.value = computed(() => store.getters.getDarkMode).value ? "dark" : "light";
    changeTheme()
  }

  function changeTheme(){
    if(computed(() => store.getters.getDarkMode).value){
      store.dispatch('change_theme', 'dark')
      store.dispatch('change_loading_color', 'white')
    } 
    else{
      store.dispatch('change_theme', 'light')
      store.dispatch('change_loading_color', 'indigo')
    } 
  }

  function logout(){
    store.dispatch('access_token', null)
    store.dispatch('change_auth', false)
    store.dispatch('set_user', null)
    store.dispatch('set_user_name', null)
    store.dispatch('set_user_surname', null)
    window.$cookies.remove('logged')
    router.push({
      name: 'home'
    })
  }

</script>

<template>
  <v-app-bar color="blue" prominent>
    <v-spacer></v-spacer>
    <v-icon class="mr-5" icon="mdi-security"></v-icon>
    <v-toolbar-items v-if="log">
      <v-btn to="dashboard">Dashboard</v-btn>
      <v-btn to="tools">Tools</v-btn>
    </v-toolbar-items>
    <v-spacer></v-spacer>
    <v-btn @click="toggleTheme" icon="mdi-theme-light-dark"></v-btn>
    <v-btn v-if="!log" to="login" icon="mdi-account"></v-btn>
    <v-menu v-else min-width="200px" rounded>
      <template v-slot:activator="{ props }">
        <v-btn v-bind="props">
          <v-avatar color="blue-darken-4" size="small">
            <span class="text-caption">
              {{ computed(() => store.getters.getUserName).value[0].toUpperCase() + computed(() => store.getters.getUserSurname).value[0].toUpperCase() }}
            </span>
          </v-avatar>
        </v-btn>
      </template>
      <v-card>
        <v-card-text>
          <div class="mx-auto text-center">
              <h3>
                {{ computed(() => store.getters.getUserName).value + ' ' + computed(() => store.getters.getUserSurname).value }}
              </h3> 
              <p class="text-caption mt-1">
                {{ computed(() => store.getters.getUser).value }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" to="profile">
                Edit Account
              </v-btn>
              <v-divider class="my-3"></v-divider>
              <v-btn @click="logout" rounded variant="text">
                Log out   
              </v-btn>
            </div>
          </v-card-text>
        </v-card>
    </v-menu>
    <v-spacer></v-spacer>
  </v-app-bar>

</template>