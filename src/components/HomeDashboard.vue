<script setup>
    import { computed } from '@vue/reactivity';
    import { reactive } from 'vue';
    import { onMounted, ref } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, email, helpers } from '@vuelidate/validators' 

    const store = useStore()
    const log = computed(() => store.getters.getAuth)
    var vault = ref(null)
    var site = ref(null)
    var dialog = ref(false)
    var addDialog = ref(false)
    var lastOP = ref(false)

    const data = reactive({
        name: '',
        email: '',
        password: '',
        link: '',
        notes: '',
    })

    const rules = computed(() => {
        return{
            name: { required: helpers.withMessage('name is required', required), 
            },
            email: { required: helpers.withMessage('email is required', required), 
                email : helpers.withMessage(' is not a valid email address', email)
            },
            password: { required: helpers.withMessage('password is required', required), 
            },
        }
    })
    
    const v$ = useVuelidate(rules, data)
    
    onMounted( () => {
        if(log)
            getVault()
    })
    
    function showDetails(item){
        site.value = item;
        dialog.value = true;
    }

    function add(){
        addDialog.value = true;
    }

    async function getVault(){
        const token = computed(() => store.getters.getToken)
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token.value,
            },

        })
        if(response.status == 200){
            const data = await response.json()
            vault.value = data.vault
            lastOP.value = true
        }
        else{
            lastOP.value = false
        }
    }

    /*async function update(){
        const response = fetch()
    }*/

    async function checkAddRecord(){
        const result = await v$.value.$validate()
        if(result)
            await addRecord()
    }

    async function addRecord(){
        const token = computed(() => store.getters.getToken)
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token.value,
            },
            body: JSON.stringify(data)
        })
        if(response.status == 201){
            lastOP.value = true
        }
        else{
            lastOP.value = false
        }
        addDialog.value = false
        getVault()
    }

    async function deleteRecord(){
        const token = computed(() => store.getters.getToken)
        const response = await fetch(process.env.VUE_APP_VAULT  + '/' + site.value.element_id, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token.value,
            },
        })
        if(response.status == 200){
            lastOP.value = true
        }
        else{
            lastOP.value = false
        }
        dialog.value = false
        getVault()
        
    }
</script>

<template>
    <v-container class="mt-16 d-flex align-center">
        <v-row>
            <v-col cols="2"/>
            <v-col cols="8">
                <v-container>
                    <v-row>
                        <v-col cols="12">
                            <div class="text-h3 font-weight-light">Dashboard</div>
                            <v-divider class="border-opacity-100"></v-divider>
                        </v-col>
                    </v-row>
                </v-container>
            </v-col>
            <v-col cols="2"/>
        </v-row>
    </v-container>

    <v-container class="mt-8">
        <v-row>
            <v-col cols="2"/>
            <v-col class="rounded" cols="2">
                a
            </v-col>
            <v-col class="rounded" cols="4">
                <div class="d-flex justify-space-between align-center" v-for="item in vault" :key="item.element_id">
                    <v-sheet class="ma-1 pa-1 align-center">
                        {{ item.name }}
                    </v-sheet>

                    <v-sheet class="ma-1 pa-1 align-center">
                        <v-btn variant="outlined" @click="showDetails(item)">Modify</v-btn>
                    </v-sheet>
                </div>
                <v-dialog persistent v-model="dialog" width="1024">
                    <v-card>
                        <!--v-card-text>
                            {{ site }}
                        </v-card-text-->
                        <v-card-title class="d-flex align-self-center">
                            <div class="mt-1 pt-1 text-h5">{{ site.name }}</div>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" sm="6">
                                        <v-text-field label="Email" v-model="site.email"/>
                                    </v-col>
                                    <v-col cols="12" sm="6">
                                        <v-text-field label="Password" v-model="site.password"/>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Link" v-model="site.link"/>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Notes" v-model="site.notes"/>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                                Close
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="deleteRecord()">
                                Delete
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                                Update
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
            <v-col class="rounded" cols="2">
                <div class="d-flex justify-space-around align-center">
                    <v-sheet class="ma-1 pa-1 align-center">
                        <v-btn variant="outlined" @click="add()">Add new record</v-btn>
                    </v-sheet>
                </div>
                <v-dialog persistent v-model="addDialog" width="1024">
                    <v-card>
                        <!--v-card-text>
                            {{ site }}
                        </v-card-text-->
                        <v-card-title class="d-flex align-self-center">
                            <div class="mt-1 pt-1 text-h5">Add a record</div>
                        </v-card-title>
                        <v-card-text>
                            <v-container>
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field label="Name" v-model="data.name"/>
                                        <div
                                        class="text-caption text-red"
                                        v-for="error in v$.name.$errors"
                                        :key="error.$uid"
                                        >
                                            {{ data.name + error.$message }}
                                        </div>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field label="Email" v-model="data.email"/>
                                        <div
                                        class="text-caption text-red"
                                        v-for="error in v$.email.$errors"
                                        :key="error.$uid"
                                        >
                                            {{ email.name + error.$message }}
                                        </div>
                                    </v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field label="Password" v-model="data.password"/>
                                        <div
                                        class="text-caption text-red"
                                        v-for="error in v$.password.$errors"
                                        :key="error.$uid"
                                        >
                                            {{ data.password + error.$message }}
                                        </div>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Link" v-model="data.link"/>
                                    </v-col>
                                    <v-col cols="12">
                                        <v-text-field label="Notes" v-model="data.notes"/>
                                    </v-col>
                                </v-row>
                            </v-container>
                        </v-card-text>
                        <v-card-actions>
                            <v-spacer></v-spacer>
                            <v-btn color="blue-darken-1" variant="text" @click="addDialog = false">
                                Close
                            </v-btn>
                            <v-btn color="blue-darken-1" variant="text" @click="checkAddRecord()">
                                Add
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-dialog>
            </v-col>
            <v-col cols="2"/>
        </v-row>
    </v-container>
    

  </template>