<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
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
  function logout(){
    store.dispatch('access_token', null)
    store.dispatch('set_user', null)
  }
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
      <v-list density="compact" nav v-if="log">
        <v-list-item @click="logout" prepend-icon="mdi-logout" title="Logout" value="logout"></v-list-item>
      </v-list>
    </template>
    
  </v-navigation-drawer>
</template>