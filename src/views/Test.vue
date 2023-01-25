<template>
    <v-container class="white lighten-5">
      <v-row> 
        <v-col
          cols="12"
          lg="4"
        >
        <DisplayProfile/>
        </v-col>
        <v-col
          cols="12"
          lg="8"
        >
        <DataAmount/>
        </v-col>
      </v-row>
      <v-row> 
        <v-col
          cols="12"
          lg="4"
        >
        <LastData />
        </v-col>
        <v-col
          cols="12"
          lg="4"
        >
        <QuestionBySubject/>
        </v-col>
        <v-col
          cols="12"
          lg="4"
        >
        <TestsByWeek/>
        </v-col>
      </v-row>
      <v-row> 
        <v-col
          cols="12"
          lg="4"
        >
        <PendentRequests/>
        </v-col>
        <v-col
          cols="12"
          lg="8"
        >
        <TestsTable/>
        </v-col>
      </v-row>

    </v-container>
  </template>

<script>

import DisplayProfile from "@/components/Dashboard/DisplayProfile";
import DataAmount from "@/components/Dashboard/DataAmount";
import LastData from "@/components/Dashboard/Admin/LastData";
import QuestionBySubject from "@/components/Dashboard/QuestionBySubject";
import TestsByWeek from "@/components/Dashboard/TestsByWeek";
import TestsTable from "@/components/Dashboard/TestsTable";
import PendentRequests from "@/components/Dashboard/PendentRequests";
import LastRequests from "@/components/Dashboard/Appraiser/LastRequests"; 
export default {

components:{
    DisplayProfile,  
    DataAmount,  
    LastData,
    QuestionBySubject,
    TestsByWeek,
    TestsTable,
    PendentRequests,
    LastRequests
},
};


</script>

