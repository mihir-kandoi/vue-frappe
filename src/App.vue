<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <main>
    <sidebar-menu :menu="menu" :hideToggle="true" width="250px"/>
    <RouterView style="padding: 18px; padding-left: 268px;" :key="$route.fullPath"/>
  </main>
</template>

<script>
export default {
  data() {
    return {
      menu: [
        {
          header: 'Main Navigation',
        },
        {
          href: '/',
          title: 'Dashboard',
          icon: {
            element: 'span',
            class: 'material-icons',
            text: 'home'
          },
        },
        {
          header: 'CRUD',
        },
        {
          href: '/crud/books',
          title: 'Books',
          icon: {
            element: 'span',
            class: 'material-icons',
            text: 'book'
          },
        },
        {
          href: '/crud/members',
          title: 'Members',
          icon: {
            element: 'span',
            class: 'material-icons',
            text: 'person'
          },
        },
      ],
    }
  },
}
</script>

<style scoped>
main {
  display: flex;
}
</style>