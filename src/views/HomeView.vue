<template>
  <HomeComp />
</template>

<script>
import { defineComponent } from 'vue';

// Components
import HomeComp from '../components/HomeComp.vue';

export default defineComponent({
  name: 'HomeView',

  components: {
    HomeComp,
  },
});
</script>
