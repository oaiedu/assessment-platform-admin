<template>
    <div class="home">
        <v-container v-if="user != null || user != undefined">
            <v-row justify="center">
                <v-col sm=4>
                    <profile />
                </v-col>
                <v-col sm=8>
                    <statistics-questions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
                </v-col>
            </v-row>
            <fab :userClaims='userClaims' v-if='!userClaims["student"]' />
        </v-container>

        <v-row justify="center" align="center" v-else>
            <v-col class="section-1" cols="9"/>
            <v-col>
                <v-container>
                    <SignUser/>
                </v-container>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    // @ is an alias to /src
    import Fab from '@/components/Fab.vue'
    import StatisticsQuestions from '@/components/Questions/StatisticsQuestions'
    import profile from '@/components/DisplayProfile'
    import SignUser from '@/components/SignUser'

    export default {
        name: 'home',
        components: {
            Fab,
            StatisticsQuestions,
            SignUser,
            profile
        },
        computed: {
            user() {
                return this.$store.getters.user;
            },
            userInfo() {
                return this.$store.getters.userInfo;
            },
            statistics() {
                let statisticsObj = [];
                const cat = this.$store.getters.getSubjects;
                cat.forEach(element => {
                    const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubject(element);
                    statisticsObj.push({ name: element, questions: numberOfQuestions });
                });
                return statisticsObj;
            },
            numberOfQuestions() {
                return this.$store.getters.numberOfQuestions;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            }
        }
    }
</script>

<style>
    .section-1 {
        height: calc(100vh - 48px);
        background: url("https://firebasestorage.googleapis.com/v0/b/pwr-quiz-generator.appspot.com/o/home-background.jpg?alt=media&token=9f763b10-06ae-450e-90d1-96bbc7667376");
    }
</style>
