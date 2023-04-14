<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
  import { ref, onMounted } from 'vue';
  import { useTheme } from "vuetify";
  
  const theme = useTheme();
  var darkMode = ref(true);
  theme.global.name.value = "dark"

  function toggleTheme(){
    darkMode.value = !darkMode.value
    theme.global.name.value = darkMode.value ? "dark" : "light";
    loadingColor()
  }

  function loadingColor(){
    if(darkMode.value) store.dispatch('change_loading_color', 'white')
    else store.dispatch('change_loading_color', 'indigo')
  }

  const store = useStore()
  const log = computed(() => store.getters.getAuth)
  onMounted(() => {
    loadingColor()
  });
  
  //const user = computed(() => store.getters.getUser)

/*-----------------------------------------------------------------*/ 
  //TEMPORARY
  function logout(){
    store.dispatch('access_token', null)
    store.dispatch('change_auth', false)
    store.dispatch('set_user', null)
    window.$cookies.remove('logged')
  }
/*-----------------------------------------------------------------*/ 

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
    <v-btn @click="logout" v-else variant="text" icon="mdi-logout"></v-btn>
    <v-spacer></v-spacer>
  </v-app-bar>

</template>