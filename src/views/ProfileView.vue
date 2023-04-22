<script setup>
import { reactive, computed, onMounted } from 'vue';
import { useStore } from 'vuex';

const store = useStore()

const basicInfo = reactive({
    Name: computed(() => store.getters.getUserName).value,
    Surname: computed(() => store.getters.getUserSurname).value,
    Birthday: 'Not set',
    Gender: 'Not set',
})

const contactInfo = reactive({
    Email: computed(() => store.getters.getUser).value,
    Phone: 'Not set',
})

onMounted(async () => {
    if (computed(() => store.getters.getAuth).value) {
        await getUser()
    }
})

async function getUser() {
    const dataToSend = {"user_id": computed(() => store.getters.getUser).value }
    console.log(dataToSend)
    const response = await fetch(process.env.VUE_APP_BASE_URL + '/api/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
        },
        body: JSON.stringify(dataToSend)
    })
    if(response.status == 200){
        const resData = await response.json()
        basicInfo.Birthday = resData.user.dob
        basicInfo.Gender = resData.user.gender
        contactInfo.Phone = resData.user.phone
    }
}
</script>

<template>
    <v-container class="mt-16">
        <v-row>
            <v-col cols="0" lg="3"></v-col>
            <v-col cols="12" lg="6">
                <v-row class="d-flex flex-column">
                    <v-col class="d-flex align-center justify-center">
                        <v-avatar color="blue-darken-4" size="large">
                            <span class="text-h6">
                                {{ basicInfo.Name[0].toUpperCase() + basicInfo.Surname[0].toUpperCase() }}
                            </span>
                        </v-avatar>
                    </v-col>
                    <v-col class="d-flex align-center justify-center">
                        <div class="text-h4 font-weight-regular">
                            Welcome, {{ basicInfo.Name + ' ' + basicInfo.Surname }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-row class="pa-3">
                            <v-col cols="12" md="6">
                                <div class="text-h5">
                                    Personal info
                                </div>
                            </v-col>
                        </v-row>
                    </v-col>
                    <!--Basic Info-->
                    <v-col cols="12">
                        <v-card variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Basic Info
                                        </div>
                                        <v-row class="my-sm-4 unselectable changePointer popOut">
                                            <v-col cols="3" class="d-flex align-center">
                                                Name
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ basicInfo.Name + ' ' + basicInfo.Surname }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer">
                                            <v-col cols="3" class="d-flex align-center">
                                                Birthday
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ basicInfo.Birthday || "Not set" }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer">
                                            <v-col cols="3" class="d-flex align-center">
                                                Gender
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ basicInfo.Gender || "Not set"  }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                    <!--Contact Info-->
                    <v-col cols="12">
                        <v-card class="mx-auto" variant="outlined">
                            <v-card-item>
                                <v-row class="pa-3">
                                    <v-col cols="12">
                                        <div class="text-h6 mt-1">
                                            Contact Info
                                        </div>
                                        <v-row class="my-sm-4 unselectable popOut changePointer">
                                            <v-col cols="3" class="d-flex align-center">
                                                Email
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ contactInfo.Email }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                        <v-divider thickness="1" class="border-opacity-25"></v-divider>
                                        <v-row class="my-sm-4 unselectable popOut changePointer">
                                            <v-col cols="3" class="d-flex align-center">
                                                Phone
                                            </v-col>
                                            <v-col cols="9" class="d-flex align-center">
                                                {{ contactInfo.Phone || "Not set"  }}
                                                <v-spacer></v-spacer>
                                                <v-icon class="mx-1" size="x-small" icon="mdi-arrow-right"></v-icon>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-card-item>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="0" lg="3"></v-col>
        </v-row>
    </v-container>
</template>

<style scoped> .changePointer {
     cursor: pointer;
 }

 .unselectable {
     -webkit-touch-callout: none;
     -webkit-user-select: none;
     -khtml-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
 }

 .popOut {
     transition: 0.15s;
 }

 .popOut:hover {
     color: #2196f3;
     transform: scale(1.02);
 }

 .backgroundChange:hover {
     background-color: #fafafb;
 }
</style>