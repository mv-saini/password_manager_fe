<script setup>
    import { computed } from '@vue/reactivity';
    import { onMounted, ref, watch, reactive } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, email, helpers } from '@vuelidate/validators'

    const store = useStore()
    
    const vault = ref([])
    const recordSelected = ref(null)
    const recordSelectedFolders = ref([])

    const dialog = ref(false)
    const addDialog = ref(false)
    const folderDialog = ref(false)
    const folderName = ref(null)
    const lastOP = ref(false)
    const loadingColor = computed(() => store.getters.getLoadingColor)

    const filteredList = ref([])
    const folders = ref([])

    //for checkboxes records
    const allSelected = ref(false)
    const selectedItems = ref([])

    const tags = ref([
        {icon: 'mdi-star', text: 'Favorite'},
        {icon: 'mdi-account', text: 'Accounts'},
        {icon: 'mdi-credit-card', text: 'Credit Card'},
        {icon: 'mdi-card-account-details', text: 'Identity'},
        {icon: 'mdi-note', text: 'Notes'},
    ])

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
        tags: [],
        folders: [],
    })

    const rules = computed(() => {
        return{
            name: { 
                required: helpers.withMessage('Name is required', required), 
            },
            email: { 
                required: helpers.withMessage('Email is required', required), 
                email : helpers.withMessage(' is not a valid email address', email)
            },
            password: { 
                required: helpers.withMessage('Password is required', required), 
            }
        }
    })
    
    const v$ = useVuelidate(rules, data)
    
    onMounted(async () => {
        if(computed(() => store.getters.getAuth).value){
            await getVault()
            filterTags("All")
        }
    })

    function selectAll(){
        selectedItems.value = []
        if (!allSelected.value) {
            filteredList.value.forEach(item => {
                selectedItems.value.push(item._id)
            });
        }
    }

    watch(selectedItems, () => {
        if(selectedItems.value.length == filteredList.value.length && selectedItems.value.length > 0){
            allSelected.value = true
        }
    })

    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1200);
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
        if(selectedItems.value.length > 0) deleteRecord(selectedItems.value)
    }
    
    function showDetails(item){
        recordSelected.value = item;
        recordSelectedFolders.value = []
        folders.value.map(folder => {
            var i = 0
            var found = false
            while(i < folder.v.length && !found){
                if(folder.v[i] == recordSelected.value._id){
                    recordSelectedFolders.value.push(folder.k)
                    found = true
                }
                i++
            }
        })
        dialog.value = true;
    }

    function resetSubFunctionFilter(){
        allSelected.value = false
        selectedItems.value = []
        filteredList.value = []
    }

    function filterTags(filterTag){
        resetSubFunctionFilter()
        if(filterTag == 'All'){
            filteredList.value = vault.value
        }
        else{
            vault.value.map(element => {
                element.tags.map(tag => {
                    if(tag == filterTag){
                        filteredList.value.push(element)
                    }
                })
            })
        }
    }

    function filterFolders(filterFolder){
        resetSubFunctionFilter()
        folders.value.map(folder => {
            if(folder.k == filterFolder){
                var i = 0
                while(i < folder.v.length){
                    vault.value.map(e => {
                        if(folder.v[i] == e._id){
                            filteredList.value.push(e)
                        }
                    })
                    i++
                }
            }
        })
    }

    async function getVault(){
        vault.value = []
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if(response.status == 200){
            const data = await response.json()
            vault.value = data.vault
            setTags()
            lastOP.value = true
        }
        else{
            lastOP.value = false
        }
    }

    async function setTags(){
        folders.value = []
        const response = await fetch(process.env.VUE_APP_FOLDER, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if(response.status == 200){
            const data = await response.json()
            for(const [key, value] of Object.entries(data.folders[0])){
                folders.value.push({
                    k: key,
                    v: value
                })
            }
        }
    }

    async function addFolder(){
        const response = await fetch(process.env.VUE_APP_FOLDER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(folderName.value)
        })
        if(response.status == 200){
            await getVault()
            lastOP.value = true
        }
    }

    function changeName(folder){
        folderName.value = folder
        //folders.value.indexOf(folder)
    }

    async function removeFolder(folder){
        const response = await fetch(process.env.VUE_APP_FOLDER + '/' + folder, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if(response.status == 200) await getVault()
    }

    async function update(){
        await fetch(process.env.VUE_APP_VAULT + '/' + recordSelected.value._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(recordSelected)
        })
        await getVault()
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
        clearData()
        addDialog.value = false
    }

    function clearData(){
        data.email = ''
        data.name = ''
        data.link = ''
        data.notes = ''
        data.password = ''
        data.tag = []
        data.type = []
        v$.value.$reset()
    }

    async function deleteRecord(id){
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            credentials: 'include',
            body: JSON.stringify({"tags" : id})
        })
        lastOP.value = response.status === 200
        await getVault()
    }
    //d-none d-lg-flex
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
    <v-container class="mt-16">
        <v-row>
            <!--1st-->
            <v-col cols="4" md="4" xl="4" class="d-flex flex-column unselectable">
                <v-row>
                    <v-col md="6" class="d-none d-xl-flex"></v-col>
                    <v-col cols="12" md="6" >
                        <div rounded class="pa-xl-6 mx-auto" max-width="400">
                            <div class="px-xl-2 text-h6 font-weight-bold">
                                Filter
                                <v-divider thickness="1"></v-divider>
                            </div>
                            
                            <div class="px-xl-2 text-subtitle-1 font-weight-light">
                                <div>
                                    All tags
                                </div>
                                <div class="pl-xl-6 popOut changePointer" @click="filterTags('All')">
                                    <v-icon size="small" icon="mdi-set-all"></v-icon>
                                    All
                                </div>
                                <div class="pl-xl-6 popOut changePointer" @click="filterTags(tag.text)" v-for="tag in tags" :key="tag.text">
                                    <v-icon size="small" :icon="tag.icon"></v-icon>
                                    {{ tag.text }}
                                </div>
                            </div>
                            <v-divider thickness="1"></v-divider>
                            <div class="px-xl-2 pt-1 text-subtitle-1 font-weight-light">
                                <div class="d-flex"> 
                                    <div>
                                        All folders
                                    </div>
                                    <v-spacer/>
                                    <div class="align-center popOut">
                                        <v-icon size="x-small" icon="mdi-pencil-outline" @click="selectMultipleFolder()"/>
                                    </div>
                                    <div class="align-center popOut">
                                        <v-icon size="x-small" icon="mdi-plus" @click="folderDialog = true"/>
                                    </div>
                                </div>
                                <div class="pl-xl-6 d-flex" v-for="folder in folders" :key="folder.k">
                                    <div class="popOut changePointer" @click="filterFolders(folder.k)">
                                        <v-icon size="small" icon="mdi-folder"></v-icon>
                                        {{ folder.k }}
                                    </div>
                                    <v-spacer></v-spacer>
                                    <div class="align-center popOut">
                                        <v-icon size="x-small" icon="mdi-pencil-outline" @click="changeName(folder.k)"/>
                                    </div>
                                    <div class="align-center popOut">
                                        <v-icon size="x-small" icon="mdi-minus" @click="removeFolder(folder.k)"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-col>

            <!--2nd-->
            <v-col cols="8" md="8" xl="4" class="d-flex flex-column">
                <!--DASHBOARD ROW-->
                <v-row>
                    <v-col cols="12" sm="6">
                        <div class="text-h3 font-weight-light">Dashboard</div>
                    </v-col>
                    <v-col class="d-flex justify-sm-end" cols="12" sm="6">
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
                        <v-checkbox class="mt-5" @click="selectAll()" v-model="allSelected"></v-checkbox>
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

                <!--EMPTY RECORDS ROW-->
                <v-row v-if="filteredList.length == 0">
                    <v-col>
                        <v-row class="d-flex justify-center align-center">
                            <v-col cols="2"></v-col>
                            <v-col cols="8">
                                <div class="text-start align-center justify-center d-flex flex-row">
                                    <div class="pa-3 text-h6 ">
                                         No records found
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="2"></v-col>
                            <v-divider thickness="1" class="border-opacity-100"></v-divider>
                        </v-row>
                    </v-col>
                </v-row>

                <!--RECORDS ROW-->
                <v-row v-for="item in filteredList" :key="item._id" v-else>
                    <v-col>
                        <v-row class="d-flex justify-center align-center">
                            <v-col cols="2">
                                <v-checkbox class="mt-5" v-model="selectedItems" @click="select()" :value="item._id"></v-checkbox>
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
            <v-col cols="0" md="0" xl="4">
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
                            <v-text-field label="Name" v-model="recordSelected.name"/>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="recordSelectedFolders" :items="folders" item-title="k" item-value="k" label="Folders" chips multiple/>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="recordSelected.tags" :items="tags" item-title="text" item-value="text" label="Tags" chips multiple/>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Email" v-model="recordSelected.email"/>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Password" v-model="recordSelected.password"/>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field label="Link" v-model="recordSelected.link"/>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea label="Notes" v-model="recordSelected.notes"></v-textarea>
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
                        <v-select v-model="data.folders" :items="folders" item-title="k" item-value="k" label="Folders" chips multiple/>
                    </v-col>
                    <v-col cols="12" sm="6" md="3">
                        <v-select v-model="data.tags" :items="tags" item-title="text" item-value="text" label="Tags" chips multiple/>
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

    <v-dialog v-model="folderDialog" width="500">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Add a new folder
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-text-field v-model="folderName" label="Folder Name" clearable></v-text-field>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="addFolder()">
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