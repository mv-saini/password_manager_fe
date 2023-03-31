<script setup>
  import router from '@/router';
import { onMounted, ref } from 'vue';
  const log = ref(false)
  onMounted(async () => {
    const msg = await fetch('http://localhost:3000/api/user',{
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });
    if(msg.status == 200){
      log.value = !log.value;
    }
  });
  function login(){
    router.push({
      name: 'login'
    });
  }
  function logout(){
    //logout 
  }
</script>
<template>
    <v-navigation-drawer
      expand-on-hover
      rail
    >
    
    <v-list>
      <v-list-item v-if="log"
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        title="Logged"
        subtitle="sandra_a88@gmailcom"
      ></v-list-item>
      <v-list-item v-else @click="login"
        prepend-icon="mdi-account"
        title="Log In"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>
    
    <v-list density="compact" nav>
      <v-list-item prepend-icon="mdi-home" title="Home" value="home" flat to="/"></v-list-item>
      <v-list-item prepend-icon="mdi-folder" title="My Files" value="myfiles"></v-list-item>
      <v-list-item prepend-icon="mdi-account-multiple" title="Shared with me" value="shared"></v-list-item>
      <v-list-item prepend-icon="mdi-star" title="Starred" value="starred"></v-list-item>
    </v-list>
    
    <template v-slot:append v-if="log">
      <v-list density="compact" nav>
        <v-list-item @click="logout" prepend-icon="mdi-logout" title="Logout" value="logout"></v-list-item>
      </v-list>
    </template>
    
  </v-navigation-drawer>
</template>