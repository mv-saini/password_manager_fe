<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
  import { ref } from 'vue';
  import { useTheme } from "vuetify";
  
  const theme = useTheme();
  var darkMode = ref(false);
  theme.global.name.value = "light"

  function toggleTheme(){
    darkMode.value = !darkMode.value
    theme.global.name.value = darkMode.value ? "dark" : "light";
  }

  const store = useStore()
  /*onMounted(async () => {
    const msg = await fetch('http://localhost:3000/api/user',{
        headers: {'Content-Type': 'application/json'},
    });
    if(msg.status == 200){
      log.value = !log.value;
    }
  });*/
  const log = computed(() => store.getters.getAuth)
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