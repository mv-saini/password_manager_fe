<script setup>
import NavigationDrawer from './components/NavigationDrawer.vue';

/*
export default {
  name: 'App',

  data: () => ({
    //
  }),
}*/
</script>

<template>
  <v-app>
    <NavigationDrawer/>

    <v-main>
      <!--v-container>
        <v-row class="text-center">
          <v-col>
            <router-link to="/">Home</router-link> |
            <router-link to="/about">About</router-link>
            <router-link to="/login">Login</router-link>
          </v-col>
        </v-row>
      </v-container>
      <!-->
    <router-view/>
  
  </v-main>
  </v-app>
</template>