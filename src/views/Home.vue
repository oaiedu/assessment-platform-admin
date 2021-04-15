<template>
    <div class="home">
        <v-container v-if="user">
            <v-row justify="center">
                <v-col sm=4>
                    <Profile />
                </v-col>
                <v-col sm=8>
                    <StatisticsQuestions :statistics="statistics" :numberOfQuestions="numberOfQuestions"/>
                </v-col>
            </v-row>
            <Fab :userClaims='userClaims' v-if='!userClaims || (userClaims && !userClaims["student"])' />
        </v-container>

        <v-row justify="center" align="center" v-else>
            <img class="background-image"
                width="2647"
                height="1772"
                src="../assets/home-background.jpg"
                alt="Background Image" >
            <div class="background-overlay"></div>
            <v-col class="sign-col" :cols="12" lg="4" md="5" sm="7" >
                <SignUser/>
            </v-col>
        </v-row>
    </div>
</template>

<script>
    // @ is an alias to /src
    import Fab from '@/components/Fab.vue';
    import StatisticsQuestions from '@/components/Questions/StatisticsQuestions';
    import Profile from '@/components/User/DisplayProfile';
    import SignUser from '@/components/User/SignUser';

    export default {
        name: 'home',
        components: {
            Fab,
            StatisticsQuestions,
            SignUser,
            Profile
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
                const subjects = this.$store.getters.getSubjects;
                subjects.forEach(element => {
                    const numberOfQuestions = this.$store.getters.getNumberOfQuestionBySubject(element);
                    statisticsObj.push({ name: element, questions: numberOfQuestions });
                });
                return statisticsObj;
            },
            numberOfQuestions() {
                return this.$store.getters.getDataSize.questions.general;
            },
            userClaims() {
                return this.$store.getters.getUserClaims;
            }
        }
    }
</script>

<style>
    .sign-col {
        position: absolute;
    }

    .background-overlay {
        position: absolute;
        height: calc(100vh - 36px);
        width: 100%;
        background-color: #0006;
    }

    .background-image {
        height: calc(100vh - 36px);
        width: 100%;
        object-fit: cover;
    }
</style>
