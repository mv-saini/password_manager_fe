<script setup>
import router from '@/router';
function login() {
  router.push({
    name: 'login'
  });
}
function register() {
  router.push({
    name: 'register'
  });
}
</script>
<template>
  <v-container class="text-center mt-8">
    <v-row>
      <v-col cols="0" md="2"/>
      <v-col cols="12" md="8">
        <div class="text-h2 text-center font-weight-medium">Let password manager free your memory</div>
      </v-col>
      <v-col cols="0" md="2"/>
    </v-row>

    <v-row>
      <v-col cols="0" md="2"/>
      <v-col cols="12" md="8">
        <div class="text-h6 text-center">All of your passwords, credit cards, and personal info in a single secure place.
        </div>
      </v-col>
      <v-col cols="0" md="2"/>
    </v-row>

    <v-row>
      <v-col cols="0" md="3"/>
      <v-col cols="6" md="3" class="text-center">
        <div class="pb-1 text-caption text-center font-italic font-weight-thick">Already have an account.</div>
        <v-btn @click="login" prepend-icon="mdi-account" variant="outlined">
          Login
        </v-btn>
      </v-col>
      <v-col cols="6" md="3" class="text-center">
        <div class="pb-1 text-caption text-center font-italic font-weight-thick">Don't have an account.</div>
        <v-btn @click="register" prepend-icon="mdi-account-plus" variant="outlined">
          Register
        </v-btn>
        <div class="pt-1 text-caption text-center font-italic font-weight-thick">No credit card required.</div>
      </v-col>
      <v-col cols="0" md="3" />
    </v-row>
  </v-container>
</template>