<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
  import { ref } from 'vue';
  import { useTheme } from "vuetify";
  
  const theme = useTheme();
  var darkMode = ref(true);
  theme.global.name.value = "dark"

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
  const user = computed(() => store.getters.getUser)


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
    <v-navigation-drawer
      expand-on-hover
      rail
    >

    <v-list>
      <v-list-item prepend-icon="mdi-account" title="Login" to="login" v-if="!log"></v-list-item>
      <v-list-item
        title="Logged"
        :subtitle="user"
        v-else></v-list-item>
    </v-list>

    <v-divider></v-divider>
    
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="Home" value="home" to="/"></v-list-item>
    </v-list>
 
    <template v-slot:append>
      <v-list density="compact" nav>
        <v-list-item @click="toggleTheme" prepend-icon="mdi-theme-light-dark" title="Theme" value="theme"></v-list-item>
        <v-list-item v-if="log" @click="logout" prepend-icon="mdi-logout" title="Logout" value="logout"></v-list-item>
      </v-list>
    </template>
    
  </v-navigation-drawer>
</template>