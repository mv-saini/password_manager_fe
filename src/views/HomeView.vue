<script setup>
  import { onMounted, computed } from 'vue';
  import { useStore } from 'vuex'
  import HomeHeaderComp from '@/components/HomeHeaderComp.vue';
  import HomeBodyComp from '@/components/HomeBodyComp.vue';

  const store = useStore()
  const log = computed(() => store.getters.getAuth)

  onMounted(async () => {
    /*const msg = await fetch('http://localhost:3000/api/user',{
        headers: {'Content-Type': 'application/json'},
    });
    if(msg.status == 200){
      log.value = !log.value;
    }*/
    cookie_exist()
  });

  function cookie_exist(){
    if(!window.$cookies.isKey('logged')){
      store.dispatch('access_token', null)
      store.dispatch('change_auth', false)
      store.dispatch('set_user', null)
    }
  }
</script>

<template>
  <HomeHeaderComp v-if="!log"/>
  <HomeBodyComp v-else/>
</template>