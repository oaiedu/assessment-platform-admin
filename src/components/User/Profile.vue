<template>
  <v-container class="profile__container ma-0 pa-0 pb-8" fluid>
    <v-row
      class="profile__personal-row ma-0 pa-0"
      style="height: 100px; background-color: #2196f3"
      :class="{
        'px-12': $vuetify.breakpoint.width >= 940,
        'px-4': $vuetify.breakpoint.width < 940,
      }"
    >
      <v-file-input
        v-model="avatarImage"
        id="fileUpload"
        style="display: none"
        @change="readUrl"
      />

      <div class="profile__personal-container">
        <v-avatar
          clickable
          size="140"
          class="profile__avatar"
          @click="addImage()"
        >
          <v-overlay v-if="loadingImage" absolute>
            <v-progress-circular
              indeterminate
              color="white"
            ></v-progress-circular>
          </v-overlay>

          <img
            v-if="!imagesAsURL"
            class="profile__photo"
            style="object-fit: cover"
            src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
          />
          <img
            v-else
            class="profile__photo"
            style="object-fit: cover"
            :src="imagesAsURL"
          />
        </v-avatar>

        <div class="profile__personal-info ml-4">
          <span class="profile__name">
            <span v-if="!editingName" class="mr-2">{{ nickName }}</span>

            <span v-else>
              <v-text-field
                v-model="nickName"
                dark
                hide-details
                class="ma-0 pa-0"
                color="white"
              ></v-text-field>
            </span>

            <v-btn icon :loading="loadingName">
              <v-icon
                @click="
                  !editingName ? (editingName = !editingName) : updateName()
                "
              >
                {{ editingName ? mdiContentSave : mdiPencil }}
              </v-icon>
            </v-btn>
          </span>

          <span class="profile__email">{{ user.email }}</span>
          <span class="profile__role">{{ $t('USER.ROLE.' + user.role) }}</span>
        </div>
      </div>
    </v-row>

    <v-row
      class="pa-0 ma-0 profile__data-row"
      :class="{
        'px-12': $vuetify.breakpoint.width >= 940,
        'px-4': $vuetify.breakpoint.width < 940,
      }"
    >
      <div
        class="profile__card-column subject ma-0 pa-0"
        style="flex: 1"
        :class="{
          'mr-8': $vuetify.breakpoint.width >= 800,
          'mr-0': $vuetify.breakpoint.width < 800,
        }"
      >
        <v-card
          outlined
          elevation="0"
          height="360"
          class="pa-4 px-8 ma-0"
          style="border-radius: 26px"
        >
          <v-card-title class="profile__subjects-title pa-0 ma-0">
            {{ $t('PROFILE.SUBJECTS.title') }}
          </v-card-title>

          <v-row
            v-for="(subject, index) in subjects"
            class="profile__subject-container pa-0 ma-0 my-3"
            :key="subject.id"
          >
            <span class="profile__subject-name">{{ subject.name }}</span>

            <div class="profile__subject-amount-container">
              <span
                class="profile__subject-amount"
                :style="{ backgroundColor: subjectColors[index] }"
              >
                {{ Math.floor(subject.value) }}
              </span>

              <div class="profile__subject-progress-container">
                <div
                  class="profile__subject-progress-bg"
                  :style="{ backgroundColor: subjectColors[index] }"
                />

                <div
                  class="profile__subject-progress-bar"
                  :style="{
                    backgroundColor: subjectColors[index],
                    width: `${subject.percentage}%`,
                  }"
                />
              </div>
            </div>
          </v-row>
        </v-card>
      </div>

      <div class="profile__card-column ma-0 pa-0">
        <v-card
          outlined
          elevation="0"
          class="profile__amount-card pa-4 px-8 ma-0"
          height="360"
          :width="$vuetify.breakpoint.width >= 800 ? '350' : '100%'"
        >
          <v-row class="ma-0 pa-0">
            <div class="profile__amount-item">
              <v-icon color="#783fdf" style="background-color: #783fdf3f">{{
                mdiFileChart
              }}</v-icon>

              <div class="profile__amount-info">
                <span class="profile__amount-item-title">
                  {{ $t('PROFILE.DATA_INFO.ended_quizzes') }}
                </span>

                <span
                  class="profile__amount-item-quantity"
                  style="color: #783fdf"
                >
                  {{ user.attempts.length }}
                </span>
              </div>
            </div>
          </v-row>

          <v-row class="ma-0 pa-0">
            <div class="profile__amount-item">
              <v-icon color="#42d662" style="background-color: #42d6623f">{{
                mdiMedal
              }}</v-icon>

              <div class="profile__amount-info">
                <span class="profile__amount-item-title">{{
                  $t('PROFILE.DATA_INFO.approved')
                }}</span>

                <span
                  class="profile__amount-item-quantity"
                  style="color: #42d662"
                >
                  {{ user.attempts.filter(a => a.approved).length }}
                </span>
              </div>
            </div>
          </v-row>

          <v-row class="ma-0 pa-0">
            <div class="profile__amount-item">
              <v-icon color="#2196f3" style="background-color: #2196f33f">{{
                mdiOrderBoolAscendingVariant
              }}</v-icon>

              <div class="profile__amount-info">
                <span class="profile__amount-item-title">
                  {{ $t('PROFILE.DATA_INFO.correct_answers') }}
                </span>

                <span
                  class="profile__amount-item-quantity"
                  style="color: #2196f3"
                >
                  {{ Math.floor(totalCorrect) }}%
                </span>
              </div>
            </div>
          </v-row>

          <v-row class="ma-0 pa-0">
            <div class="profile__amount-item">
              <v-icon color="#ff9900" style="background-color: #ff99003f">{{
                mdiClockOutline
              }}</v-icon>

              <div class="profile__amount-info">
                <span class="profile__amount-item-title">
                  {{ $t('PROFILE.DATA_INFO.time_per_quiz') }}
                </span>

                <span
                  class="profile__amount-item-quantity mt-1"
                  style="color: #ff9900"
                >
                  {{ getAverageTime().hours }}h {{ getAverageTime().minutes }}m
                  {{ getAverageTime().seconds }}s
                </span>
              </div>
            </div>
          </v-row>
        </v-card>
      </div>
    </v-row>

    <v-row
      class="pa-0 ma-0 mt-8"
      :class="{
        'px-12': $vuetify.breakpoint.width >= 940,
        'px-4': $vuetify.breakpoint.width < 940,
      }"
    >
      <v-card
        outlined
        elevation="0"
        width="100%"
        min-height="360"
        class="pa-0 py-4 ma-0"
        style="border-radius: 26px; overflow: hidden"
      >
        <v-card-title class="profile__attempts-title pa-0 ma-0 mx-8 mb-1">
          {{ $t('PROFILE.DATA_INFO.quizzes_done') }}
        </v-card-title>

        <AttemptsTable
          v-if="user && user.attempts"
          :attempts="user.attempts.map((a, i) => ({ ...a, index: i }))"
          @reviewAttempt="reviewAttempt($event)"
        />
      </v-card>
    </v-row>
  </v-container>
</template>

<script>
import {
  mdiFileChart,
  mdiOrderBoolAscendingVariant,
  mdiMedal,
  mdiPencil,
  mdiClockOutline,
  mdiContentSave,
} from '@mdi/js'

import AttemptsTable from '../Tests/AttemptsTable.vue'

export default {
  name: 'Profile',
  components: { AttemptsTable },
  data: () => ({
    mdiFileChart,
    mdiOrderBoolAscendingVariant,
    mdiMedal,
    mdiPencil,
    mdiClockOutline,
    mdiContentSave,
    avatarImage: [],
    nickName: '',
    imagesAsURL: '',
    editingName: false,
    loadingImage: false,
    loadingName: false,
    subjectColors: ['#219653', '#2196f3', '#ff9900', '#922fdf', '#ff5533'],
    subjects: [],
    subjectsTotal: 0,
    totalCorrect: 0,
  }),
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    user() {
      return this.$store.getters.userInfo
    },
  },
  methods: {
    cancel() {
      this.$store.commit('setLoading', false)
      this.$router.back()
    },
    addImage() {
      document.getElementById('fileUpload').click()
    },
    reviewAttempt(item) {
      this.$router.push({
        name: 'quiz.exam',
        params: {
          id: item.quizId,
          mode: 'practice',
          attempt: item,
          review: true,
        },
      })
    },
    getAverageTime() {
      const avg = {
        hours: 0,
        minutes: 0,
        seconds: 0,
      }

      if (!this.user) {
        return avg
      }

      const times = this.user.attempts.map(a => a.timeTaken)

      const totalSeconds = times.reduce(
        (prev, curr) =>
          prev + (curr.hours * 3600 + curr.minutes * 60 + curr.seconds),
        0,
      )

      const seconds = Math.floor(
        totalSeconds / (this.user.attempts.length || 1),
      )

      const hours = Math.floor(seconds / (60 * 60))
      const minutes = Math.floor(seconds / 60)

      avg.hours = hours
      avg.minutes = hours > 0 ? minutes - hours * 60 : minutes
      avg.seconds = minutes > 0 ? seconds - minutes * 60 : seconds

      return avg
    },
    setSubjectsPercentage() {
      if (!this.subjects || !this.subjects[0]) {
        return 0
      }

      const maxValue =
        this.subjects[0].value + (10 - (this.subjects[0].value % 10 || 10))

      this.subjects.forEach(subject => {
        subject.percentage = (subject.value * 100) / maxValue
      })
    },
    readUrl(imageFile) {
      if (imageFile) {
        this.loadingImage = true

        if (!imageFile.type.match(/image.*/)) {
          alert('The file is not an image!')
          return
        } else if (imageFile.size > 2000000) {
          alert('O tamanho da imagem deve ser no MÁXIMO 2 MB!')
          return
        }

        const reader = new FileReader()
        reader.onload = async e => {
          this.changedImage = true
          this.imagesAsURL = e.target.result

          await this.uploadImage(imageFile)

          this.loadingImage = false
        }
        reader.readAsDataURL(imageFile)
      }
    },
    async uploadImage(file) {
      if (!file) {
        return
      }

      const url = await this.$store.dispatch('uploadAvatar', { image: file })
      this.imagesAsURL = url

      await this.$store.dispatch('updateUser', { profileImages: url })
    },
    async updateName() {
      this.loadingName = true

      await this.$store.dispatch('updateUser', { name: this.nickName })

      this.editingName = false
      this.loadingName = false
    },
  },
  mounted() {
    if (!this.user) {
      return
    }

    this.nickName = this.user.name
    this.imagesAsURL = this.user.profileImages

    this.subjects = [...this.$store.state.Subject.subjects].map(s => ({
      name: s.name,
      value: 0,
      total: 0,
      percentage: 0,
    }))

    let questionsAmount = 0

    this.user.attempts.forEach(a => {
      a.subjects.forEach(s => {
        const index = this.subjects.findIndex(sub => sub.name === s.subject)

        questionsAmount += s.questions.length

        const value = s.questions.reduce((prev, curr) => {
          const answer = a.answers.find(ans => ans.questionName === curr)

          if (!answer) {
            return prev + 0
          }

          return prev + answer.correct
        }, 0)

        if (index === -1) {
          this.subjects.push({
            name: s.subject,
            value,
            total: s.questions.length,
            percentage: 0,
          })

          return
        }

        this.subjects[index].value += value
        this.subjects[index].total += s.questions.length
      })
    })

    this.subjects.sort((s1, s2) => s2.value - s1.value)

    this.subjects = this.subjects.slice(0, 5)

    this.subjectsTotal = this.subjects.reduce(
      (prev, curr) => prev + curr.value,
      0,
    )

    this.totalCorrect = (this.subjectsTotal * 100) / (questionsAmount || 1)

    setTimeout(() => {
      this.setSubjectsPercentage()
    }, 150)
  },
}
</script>

<style scoped>
.profile__personal-row {
  margin-bottom: 8rem !important;
}

.profile__personal-container {
  display: flex;
  align-items: center;

  transform: translateY(30%);
}

.v-avatar {
  position: relative;

  border: 4px solid transparent;
  background-color: #fff;
}

.v-avatar .profile__photo {
  position: relative;

  object-fit: cover;
}

.v-avatar .profile__photo:hover {
  cursor: pointer;
  opacity: 0.8;
}

.profile__personal-info {
  display: flex;
  flex-direction: column;
  gap: 4px;

  margin-bottom: 5px;
}

.profile__name {
  display: flex;
  align-items: center;

  height: 3rem;

  font-size: 1.8rem;
  font-weight: 500;
  color: white;
}

.profile__name /deep/ .v-input__slot {
  margin: 0 !important;
  color: white !important;
}

.profile__name /deep/ .v-text-field__details {
  display: none !important;
}

.profile__name /deep/ svg {
  color: #efefef;
}

.profile__card-column.subject {
  flex: 1;
}

.profile__subject-container {
  flex-direction: column;
}

.profile__subject-name {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;

  max-width: 75%;

  margin: 0 0 -0.7rem 2.5rem;

  overflow: hidden;

  font-size: 0.9rem;
  text-overflow: ellipsis;
}

.profile__subject-amount-container {
  display: flex;
  align-items: center;
}

.profile__subject-amount {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;

  height: 34px;
  width: 34px;

  margin-right: -5px;

  border-radius: 50%;

  font-weight: 600;
  color: white;
}

.profile__subject-progress-container {
  position: relative;

  height: 7px;
  width: 100%;
}

.profile__subject-progress-bar,
.profile__subject-progress-bg {
  position: absolute;
  top: 0;
  left: 0;

  height: 100%;

  border-radius: 7px;
}

.profile__subject-progress-bar {
  width: 0;

  transition: width 0.7s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.profile__subject-progress-bg {
  width: 100%;
  opacity: 0.35;
}

.profile__amount-card {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;

  border-radius: 26px;
}

.profile__amount-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.profile__amount-item .v-icon {
  height: 40px;
  width: 40px;

  border-radius: 50%;
}

.profile__amount-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.profile__amount-item-title {
  font-weight: 500;
  font-size: 0.9rem;
  color: #3d3d3d;
}

.profile__amount-item-quantity {
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1.2rem;
}

.profile__container /deep/ .attempts-table {
  height: calc(100% - 20px);
}

.profile__container /deep/ .attempts-table .v-data-table__wrapper {
  height: 100%;
}

@media (max-width: 799px) {
  .profile__data-row {
    flex-direction: column-reverse;
    gap: 2rem;
  }

  .profile__card-column {
    flex-wrap: wrap;

    width: 100%;
  }
}

@media (max-width: 529px) {
  .profile__personal-row {
    margin-bottom: 13rem !important;
  }

  .profile__personal-container {
    flex-direction: column;
    gap: 1rem;

    width: 100%;

    transform: translateY(23%);
  }

  .profile__personal-info {
    gap: 2px;

    margin: 0 !important;

    text-align: center;
  }

  .profile__name {
    height: 2rem;

    margin-left: 2.3rem;

    color: #1d1d1d;
  }

  .profile__name /deep/ svg {
    color: #5d5d5d;
  }

  .profile__name /deep/ .v-input__slot {
    margin: 0 !important;
    color: #1d1d1d !important;
  }

  .profile__name /deep/ .v-input__slot:before {
    border-color: rgba(33, 33, 33, 0.7) !important;
  }

  .profile__name /deep/ input {
    color: #1d1d1d;
  }
}
</style>
