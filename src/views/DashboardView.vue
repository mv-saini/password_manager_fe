<script setup>
    import { computed } from '@vue/reactivity';
    import { onMounted, ref, watch, reactive } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, email, helpers } from '@vuelidate/validators' 

    const store = useStore()
    const log = computed(() => store.getters.getAuth)

    var vault = ref([])
    var site = ref(null)

    var dialog = ref(false)
    var addDialog = ref(false)
    var lastOP = ref(false)

    //for checkboxes
    var allSelected = ref(false)
    var selectedItems = ref([])

    const options = [
        { title: 'Copy Email' },
        { title: 'Copy Password' },
        { title: 'Delete' },
    ]

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

    function selectAll(){
        selectedItems.value = []

        if (!allSelected.value) {
            vault.value.forEach(item => {
                selectedItems.value.push(item.element_id)
            });
        }
    }

    watch(selectedItems, () => {
        if(selectedItems.value.length == vault.value.length){
            allSelected.value = true
        }
    })

    function select(){
        allSelected.value = false
    }

    function optionExe(index, val){
        if(index == 0) navigator.clipboard.writeText(val.email)  
        else if(index == 1) navigator.clipboard.writeText(val.password) 
        else if(index == 2) deleteRecord(val)
    }

    function deleteSelected(){
        console.log("elements to be deleted: ")
        console.log(selectedItems.value)
    }
    
    function showDetails(item){
        site.value = item;
        dialog.value = true;
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

    async function deleteRecord(val){
        const token = computed(() => store.getters.getToken)
        const response = await fetch(process.env.VUE_APP_VAULT  + '/' + val.element_id, {
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
    <v-container class="mt-16 ">
        <v-row>
            <v-col cols="4">
            </v-col>
            <v-col cols="4"  class="d-flex">
                <v-row>
                    <v-col cols="6">
                        <div class="text-h3 font-weight-light">Dashboard</div>
                    </v-col>
                    <v-col class="d-flex justify-end" cols="6">
                        <div>
                            <VSheet class="ma-1 pa-1">
                                <v-btn variant="outlined" prepend-icon="mdi-plus" @click="addDialog = !addDialog">Add new</v-btn>
                            </VSheet>
                        </div>
                    </v-col>
                </v-row>
            </v-col>
            <v-col cols="4">
            </v-col>
        </v-row>

        <v-row>
            <v-col cols="4"></v-col>
            <v-col cols="4" class="d-flex">
                <v-row class="d-flex justify-center align-center">
                    <v-col cols="2">
                        <v-checkbox class="mt-5" @click="selectAll" v-model="allSelected"></v-checkbox>
                    </v-col>
                    <v-col cols="8">
                        <div class="text-h6">
                            Name
                        </div>
                    </v-col>
                    <v-col cols="2">
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template> 
                            <v-list>
                                <v-list-item @click="deleteSelected()">
                                    <v-list-item-title>Delete Selected</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                    <v-divider :thickness="1" class="border-opacity-100"></v-divider>
                </v-row>
            </v-col>
            <v-col cols="4"></v-col>
        </v-row>

        <v-row v-for="item in vault" :key="item.element_id">
            <v-col cols="4"></v-col>
            <v-col cols="4">
                <v-row class="d-flex justify-center align-center">
                    <v-col cols="2">
                        <v-checkbox class="mt-5" v-model="selectedItems" @click="select" :value="item.element_id"></v-checkbox>
                    </v-col>
                    <v-col cols="8">
                        <div @click="showDetails(item)" class="text-start align-center d-flex flex-row unselectable changePointer">
                            <v-icon size="small" icon="mdi-account"></v-icon>
                            <div class="pa-3 text-h6 ">
                                {{ item.name }} 
                            </div>
                        </div>
                        
                    </v-col>
                    <v-col cols="2">
                        <v-menu>
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template> 
                            <v-list>
                                <v-list-item v-for="(option, index) in options" :key="index" :value="index" @click="optionExe(index, item)">
                                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                    <v-divider :thickness="1" class="border-opacity-100"></v-divider>
                </v-row>
            </v-col>
            <v-col cols="4"></v-col>
        </v-row>
    </v-container>

    <v-dialog persistent v-model="dialog" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    {{ site.name }}
                </div>
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
                            <v-textarea label="Notes" v-model="site.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                    Close
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
                    Update
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    
    <v-dialog persistent v-model="addDialog" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Add a record
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field label="Name" v-model="data.name"/>
                        <div class="text-caption text-red" v-for="error in v$.name.$errors" :key="error.$uid">
                            {{ data.name + error.$message }}
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field label="Email" v-model="data.email"/>
                        <div class="text-caption text-red" v-for="error in v$.email.$errors" :key="error.$uid">
                            {{ data.email + error.$message }}
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="4">
                        <v-text-field label="Password" v-model="data.password"/>
                        <div class="text-caption text-red" v-for="error in v$.password.$errors" :key="error.$uid">
                            {{ data.password + error.$message }}
                        </div>
                    </v-col>
                    <v-col cols="12">
                        <v-text-field label="Link" v-model="data.link"/>
                    </v-col>
                    <v-col cols="12">
                        <v-textarea label="Notes" v-model="data.notes"></v-textarea>
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
</template>

<style scoped>
    .changePointer{
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
</style>