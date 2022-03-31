<template>
    <v-menu offset-y>
        <v-btn flat slot="activator" color="white">
            <span>Languages</span>
        </v-btn>
        <v-list>
            <v-list-tite v-for="link in links" :key="link.text">
                <v-list-tite-action>
                    <image-icon class="icon-size" left imgsrc={{ link.icon }}> </image-icon>
                </v-list-tite-action>
                <v-list-tite-title>{{ link.text }}</v-list-tite-title>
            </v-list-tite>
        </v-list>
    </v-menu>
</template>

<script>
export default {
     data() {
        return {
           links: [
              { icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2560px-Flag_of_the_United_States.svg.png', text:'English' },
              { icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png', text:'Espanõl' },
              { icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Flag_of_Brazil.svg/640px-Flag_of_Brazil.svg.png', text:'Português-BR' },
           ]
        }
     }
}
</script>

<style>
    .icon-size{
        border-radius: 25px;
        height: 50px;
        width: 50px;
    }
</style>