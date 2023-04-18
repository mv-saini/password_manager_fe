<script setup>
    import { computed } from '@vue/reactivity';
    import { onMounted, ref, watch, reactive } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, email, helpers } from '@vuelidate/validators'

    const store = useStore()
    
    var vault = ref([])
    var site = ref(null)

    var dialog = ref(false)
    var addDialog = ref(false)
    var lastOP = ref(false)
    const loadingColor = computed(() => store.getters.getLoadingColor)

    var filteredList = ref([])
    const lastFolder = ref('')
    const folders = ref([])

    var elements = ref([
        {icon: 'mdi-star', text: 'Favorite'},
        {icon: 'mdi-account', text: 'Accounts'},
        {icon: 'mdi-credit-card', text: 'Credit Card'},
        {icon: 'mdi-card-account-details', text: 'Identity'},
        {icon: 'mdi-note', text: 'Notes'},
    ])
    
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
        tag: [],
        type: [],
    })

    const rules = computed(() => {
        return{
            name: { 
                required: helpers.withMessage('name is required', required), 
            },
            email: { 
                required: helpers.withMessage('email is required', required), 
                email : helpers.withMessage(' is not a valid email address', email)
            },
            password: { 
                required: helpers.withMessage('password is required', required), 
            }
        }
    })
    
    const v$ = useVuelidate(rules, data)
    
    onMounted(async () => {
        if(computed(() => store.getters.getAuth).value){
            await getVault()
            filter('All')
        }
    })

    function selectAll(){
        selectedItems.value = []

        if (!allSelected.value) {
            vault.value.forEach(item => {
                selectedItems.value.push(item._id)
            });
        }
    }

    watch(selectedItems, () => {
        if(selectedItems.value.length == vault.value.length){
            allSelected.value = true
        }
    })

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1000);
    })

    function select(){
        allSelected.value = false
    }

    function optionExe(index, val){
        if(index == 0) navigator.clipboard.writeText(val.email)
        else if(index == 1) navigator.clipboard.writeText(val.password) 
        else if(index == 2){
            deleteRecord([val._id])
        }
    }

    function deleteSelected(){
        deleteRecord(selectedItems.value)
    }
    
    function showDetails(item){
        site.value = item;
        dialog.value = true;
    }

    function filter(folder){
        lastFolder.value = folder
        filteredList.value = []
        if(folder == 'All' || !folderExists()){
            filteredList.value = vault.value
        }
        else{
            vault.value.map(element => {
                //rewrite this
                element.tag.map(tag => {
                    if(tag == folder){
                        filteredList.value.push(element)
                    }
                })
                element.type.map(type => {
                    if(type == folder){
                        filteredList.value.push(element)
                    }
                })
            })
        }
    }

    function folderExists(){
        if(elements.value.find(element => element.text == lastFolder.value) == undefined){
            if(folders.value.find(folder => folder == lastFolder.value) == undefined){
                return false
            }
        }
        return true
    }

    async function getVault(){
        vault.value = []
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
            folders.value = []
            vault.value.forEach(record => setTags(record.tag))
            lastOP.value = true
        }
        else{
            lastOP.value = false
        }
    }

    function setTags(tags){
        tags.map((tag) => {
            if(folders.value.find(x => x == tag) == undefined) 
                folders.value.push(tag)
            //if(elements.value.find(x => x.text == tag) == undefined) elements.value.push({icon: 'mdi-account', text: tag})
        })
    }

    async function update(){
        const modifiedData =
        {
            'name': site.value.name,
            'email': site.value.email,
            'password': site.value.password,
            'link': site.value.link,
            'notes': site.value.notes,
            'tag': site.value.tag,
            'type': site.value.type,
        }
        console.log(site.value.type)
        const response = await fetch(process.env.VUE_APP_VAULT + '/' + site.value._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(modifiedData)
        })
        lastOP.value = response.status === 200
        await getVault()
        filter(lastFolder.value)
        dialog.value = false
    }

    async function checkAddRecord(){
        const result = await v$.value.$validate()
        if(result)
            await addRecord()
    }

    async function addRecord(){
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(data)
        })
        lastOP.value = response.status === 200
        await getVault()
        filter(lastFolder.value)
        clearData()
        addDialog.value = false
    }

    function clearData(){
        data.email = ''
    }

    async function deleteRecord(id){
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            credentials: 'include',
            body: JSON.stringify({"elements" : id})
        })
        lastOP.value = response.status === 200
        await getVault()
        filter(lastFolder.value)
    }
    //d-none d-lg-flex
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
    <v-container class="mt-16">
        <v-row>
            <!--1st-->
            <v-col cols="4" class="d-flex flex-column unselectable">
                <v-row>
                    <v-col md="6" class="d-none d-lg-flex"></v-col>
                    <v-col cols="12" md="6" >
                        <div rounded class="pa-lg-6 mx-auto" max-width="400">
                            <div class="px-lg-2 text-h6 font-weight-bold">
                                Filter
                                <v-divider thickness="1"></v-divider>
                            </div>
                            
                            <div class="px-lg-2 text-subtitle-1 font-weight-light">
                                <div>
                                    All elements
                                </div>
                                <div class="pl-lg-6 popOut changePointer" @click="filter('All')">
                                    <v-icon size="small" icon="mdi-set-all"></v-icon>
                                    All
                                </div>
                                <div class="pl-lg-6 popOut changePointer" @click="filter(element.text)" v-for="element in elements" :key="element.text">
                                    <v-icon size="small" :icon="element.icon"></v-icon>
                                    {{ element.text }}
                                </div>
                            </div>
                            <v-divider thickness="1"></v-divider>
                            <div class="px-lg-2 pt-1 text-subtitle-1 font-weight-light">
                                <div class="d-flex"> 
                                    <div>
                                        All folders
                                    </div>
                                    <v-spacer/>
                                    <div>
                                        <v-btn size="x-small" style="color: #2196f3;" icon="mdi-plus"/>
                                    </div>
                                </div>
                                <div class="pl-lg-6 popOut changePointer" @click="filter(folder)" v-for="folder in folders" :key="folder">
                                    <v-icon size="small" icon="mdi-folder"></v-icon>
                                    {{ folder }}
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-col>

            <!--2nd-->
            <v-col cols="8" md="4" class="d-flex flex-column">
                <!--DASHBOARD ROW-->
                <v-row>
                    <v-col cols="12" md="6">
                        <div class="text-h3 font-weight-light">Dashboard</div>
                    </v-col>
                    <v-col class="d-flex justify-md-end" cols="12" md="6">
                        <div>
                            <VSheet class="ma-1 pa-1">
                                <v-btn color="#2196f3" style="color: white;" prepend-icon="mdi-plus" @click="addDialog = !addDialog">
                                    Add new
                                </v-btn>
                            </VSheet>
                        </div>
                    </v-col>
                    <v-divider thickness="1" class="border-opacity-100"></v-divider>
                </v-row>

                <!--NAME ROW-->
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
                                    <v-list-item-title>Delete Selected ({{ selectedItems.length }})</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                    <v-divider :thickness="1" class="border-opacity-100"></v-divider>
                </v-row>

                <v-row v-if="filteredList.length == 0">
                    <v-col>
                        <v-row class="d-flex justify-center align-center">
                            <v-col cols="2"></v-col>
                            <v-col cols="8">
                                <div class="text-start align-center justify-center d-flex flex-row">
                                    <div class="pa-3 text-h6 ">
                                         
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="2"></v-col>
                            <v-divider thickness="1" class="border-opacity-100"></v-divider>
                        </v-row>
                    </v-col>
                </v-row>

                <v-row v-for="item in filteredList" :key="item._id" v-else>
                    <v-col>
                        <v-row class="d-flex justify-center align-center">
                            <v-col cols="2">
                                <v-checkbox class="mt-5" v-model="selectedItems" @click="select" :value="item._id"></v-checkbox>
                            </v-col>
                            <v-col cols="8">
                                <div @click="showDetails(item)" class="popOut text-start align-center d-flex flex-row unselectable changePointer">
                                    <v-icon size="small" icon="mdi-account"></v-icon>
                                    <div class="pa-3 text-h6 ">
                                        {{ item.name }} 
                                        <div class="text-caption">
                                            {{ item.email }}
                                        </div>
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
                            <v-divider thickness="1" class="border-opacity-100"></v-divider>
                        </v-row>
                    </v-col>
                </v-row>
            </v-col>

            <!--3rd-->
            <v-col cols="0" md="4">
            </v-col>
        </v-row>
    </v-container>

    <v-dialog persistent v-model="dialog" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Details
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Name" v-model="site.name"/>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-combobox v-model="site.tag" :items="folders" label="Tags" chips multiple/>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="site.type" :items="elements" item-title="text" item-value="text" label="Type" chips multiple/>
                        </v-col>
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
                <v-btn color="blue-darken-1" variant="text" @click="update()">
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
                    <v-col cols="12" sm="6">
                        <v-text-field clearable label="Name" v-model="data.name"/>
                        <div class="text-caption text-red" v-for="error in v$.name.$errors" :key="error.$uid">
                            {{ data.name + error.$message }}
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-combobox v-model="data.tag" :items="folders" label="Tags" chips multiple/>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-select v-model="data.type" :items="elements" item-title="text" item-value="text" label="Type" chips multiple/>
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field label="Email" v-model="data.email"/>
                        <div class="text-caption text-red" v-for="error in v$.email.$errors" :key="error.$uid">
                            {{ data.email + error.$message }}
                        </div>
                    </v-col>
                    <v-col cols="12" sm="6">
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

    .popOut{
        transition: 0.15s;
    }

    .popOut:hover{
        color: #2196f3;
        transform: scale(1.02);
    }
</style>