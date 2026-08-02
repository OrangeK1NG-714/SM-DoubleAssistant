<script lang="ts" setup>
import { CAMPUS_THEME } from '@/constants/theme'
</script>

<template>
  <wd-config-provider :theme-vars="CAMPUS_THEME">
    <slot />
    <wd-toast />
    <wd-message-box />
  </wd-config-provider>
</template>
