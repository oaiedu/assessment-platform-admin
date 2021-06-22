<template>
    <div class="home-page">
        <Dashboard v-if="userInfo" />
    </div>
</template>

<script>
    import Dashboard from '@/components/Dashboard/Dashboard';

    export default {
        name: 'home',
        components: {
            Dashboard
        },
        computed: {
            userInfo() {
                return this.$store.getters.userInfo;
            }
        }
    }
</script>
