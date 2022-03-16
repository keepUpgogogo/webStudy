<template>
  <div class="search">
    <div class="search-input-wrapper">
      <search-input v-model="query"></search-input>
    </div>
  </div>
</template>

<script>
import searchInput from '../components/search/search-input.vue';
import {ref,watch} from "vue"
export default {
  components: { searchInput },
  name: "search",
  setup(){
    const query = ref('')

    watch(query,(newQuery)=>{
      console.log(newQuery);
    })
    return{
      query
    }
  }
};
</script>

<style>
</style>