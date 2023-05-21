<script setup>
    import { computed, onMounted, watch } from 'vue';
    import { useStore } from 'vuex';
    import { getUser } from '@/SharedJS/ProfileJS/ProfileUpdateJS'
    import ProfileError from '@/components/ProfileError.vue';
    import ProfileShowAll from '@/components/ProfileShowAll.vue';
    import ProfileName from '@/components/ProfileName.vue'
    import ProfileBirthday from '@/components/ProfileBirthday.vue';
    import ProfileGender from '@/components/ProfileGender.vue';
    import ProfileEmail from '@/components/ProfileEmail.vue';
    import ProfilePhone from '@/components/ProfilePhone.vue';
    import ProfilePassword from '@/components/ProfilePassword.vue';

    const store = useStore()

    const lastOP = computed(() => store.getters.getLastOP)
    const loadingColor = computed(() => store.getters.getLoadingColor)
    const comp = computed(() => store.getters.getShowComp)

    onMounted(async () => {
        await getUser()
    })

    watch(lastOP, () => {
        setTimeout(store.dispatch('set_lastop', true), 1200)
    })
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
    <ProfileError/>

    <v-container class="mt-16 unselectable">
        <v-row>
            <v-col cols="0" xl="3"></v-col>
            <v-col cols="12" xl="6">
                <ProfileShowAll v-if="comp == 'ShowAll'"/>
                <ProfileName v-if="comp == 'Name'"/>
                <ProfileBirthday v-if="comp == 'Birthday'"/>
                <ProfileGender v-if="comp == 'Gender'"/>
                <ProfileEmail v-if="comp == 'Email'"/> 
                <ProfilePhone v-if="comp == 'Phone'"/> 
                <ProfilePassword v-if="comp == 'Password'"/> 
            </v-col>



            <v-col cols="0" xl="3"></v-col>
        </v-row>
    </v-container>
</template>

<style> 
 .changePointer {
     cursor: pointer;
 }

 .unselectable {
     -webkit-touch-callout: none;
     -webkit-user-select: none;
     -khtml-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
 }

 .popOut {
     transition: 0.15s;
 }

 .popOut:hover {
     color: #2196f3;
     transform: scale(1.02);
 }
</style>