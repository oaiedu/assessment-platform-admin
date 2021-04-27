<template>
    <div class="home" :class="!user ? 'sign-home' : ''">
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

        <div v-else class="sign-container">
            <div class="sign-info-container">
                <img
                    width="219"
                    height="339"
                    src="../assets/CINA.png"
                    alt="CINA Image" >
                <div class="sign-info">
                    <h2>PWR Quiz Generator</h2>
                    <h1>Centro Industrial Nuclear de Aramar</h1>
                </div>
            </div>
            <SignUser/>
        </div>
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
    .sign-home {
        height: 100vh;
        width: 100vw;

        background-color: #ededed;
    }

    .sign-info-container {
        display: flex;
        justify-content: center;
        align-items: center;

        flex: 1;
        height: 100%;

        margin: 0 20px;
    }

    .sign-info-container img {
        margin-right: 20px;
    }

    .sign-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: flex-start;
    }

    .sign-info > h1 {
        color: #333;
    }

    .sign-info > h2 {
        font-weight: normal;
        color: #2196f3;
    }

    .sign-container {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;

        width: 100%;
        height: 100%;
    }

    .sign-card {
        width: 360px;
        height: 92%;

        margin-right: 30px;
    }

    @media(max-width: 1100px) {
        .sign-info-container {
            flex-direction: column;
        }

        .sign-info-container img {
            margin: 0;
        }

        .sign-info {
            flex-direction: column-reverse;
            align-items: center;
            text-align: center;
        }
    }

    @media(max-width: 735px) {
        .sign-info-container {
            display: none;
        }

        .sign-container {
            justify-content: center;
        }

        .sign-card {
            margin-right: 0;
        }
    }

    @media(max-width: 400px) {
        .sign-card {
            width: 100%;
            height: 100%;

            box-shadow: none;
        }
    }
</style>
