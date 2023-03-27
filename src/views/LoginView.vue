<script setup>
  import AppLogo from '@/components/AppLogo.vue';
  import EmailPasswordFields from '@/components/EmailPasswordFields.vue';
</script>

<template>
<AppLogo class="mt-16"/>

    <v-form @submit.prevent="submit" class="mt-8">
        <v-container>

            <EmailPasswordFields/>
            
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <v-btn variant="outlined">
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
  