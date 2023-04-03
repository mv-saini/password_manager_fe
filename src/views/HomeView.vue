<script setup>
  import { computed } from '@vue/reactivity';
  import { useStore } from 'vuex'
  import HomeDashboard from '@/components/HomeDashboard.vue';
  import HomeHeaderComp from '@/components/HomeHeaderComp.vue';
  import HomeBodyComp from '@/components/HomeBodyComp.vue';

  const store = useStore()
  const log = computed(() => store.getters.getAuth)

  /*function setCookie() {
    var name = 'hello'
    var value= 'test'
    var expires = "";
        var date = new Date();
        date.setTime(date.getTime() + (1*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}*/

</script>

<template>
  <HomeHeaderComp v-if="!log"/>
  <HomeBodyComp v-if="!log"/>
  <HomeDashboard v-else/>
</template>