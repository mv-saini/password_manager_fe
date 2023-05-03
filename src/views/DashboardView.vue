<script setup>
    import { computed } from '@vue/reactivity';
    import { onMounted, ref, watch, reactive } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, helpers } from '@vuelidate/validators'

    /**Used to access vuex store */
    const store = useStore()

    /**An array that contains all the records of the user vault */
    const vault = ref([])

    /**Contains the record selected by the user */
    const recordSelected = ref(null)

    /**Opens the dialog box to modify a record or to add a new record */
    const dialog = ref(false)

    /**Determines if the user wants to modify or to add */
    const dialogOption = ref(null)

    /**Opens the dialog box to add a new folder or to change the name of a existing folder */
    const folderDialog = ref(false)

    /**Determines if the user wants to add a new folder or to chnage the name */
    const folderOption = ref(null)

    /**Contains the old name of the folder */
    const folderOldName = ref(null)

    /**Contains the new name of a existing folder or a new folder */
    const folderName = ref(null)

    /**If the last user request was successful or not */
    const lastOP = ref(false)

    /**The color of the loading bar */
    const loadingColor = computed(() => store.getters.getLoadingColor)

    /**Contains the filtered records from the vault */
    const filteredList = ref([])

    /** */
    const lastFilter = ref("")

    /**An array that contains all the folders created by the user */
    const folders = ref([])

    /**If all the filtered records are selected or not */
    const allSelected = ref(false)

    /**An array that contains the selected filtered records */
    const selectedItems = ref([])

    /**An array of objects that contains the elements */
    const tags = [
        { icon: 'mdi-account', text: 'Accounts' },
        { icon: 'mdi-credit-card', text: 'Credit Card' },
        { icon: 'mdi-card-account-details', text: 'Identity' },
        { icon: 'mdi-note', text: 'Notes' },
    ]

    /**An array of objects that contains the options for each record */
    const options = [
        { title: 'Copy Email' },
        { title: 'Copy Password' },
        { title: 'Delete record' },
    ]

    /**An object that contains the values of input inside a form */
    const data = reactive({
        name: '', 
        email: '',
        password: '',
        link: '',
        notes: '',
        tags: ['Accounts'],
        favorite: false,
        card_holder: '',
        expiry: null,
        cvv: '',
        card_number: null,
        id_number: null,
        id_holder: ''
    })

    /**An array that contains the names of folders that will contain the record*/
    const addRemoveToFromFolder = ref([])

    /** */
    const addRemoveToFromFolderDialog = ref(false)

    /** */
    const addRemoveToFromFolderOption = ref(false)

    /**Rules that need to be met before submitting the form */
    const rules = computed(() => {
        return {
            name: {
                required: helpers.withMessage('Name is required', required),
            },
        }
    })

    /**Validates the data by using rules */
    const v$ = useVuelidate(rules, data)

    /**Executes the functions when the page is loaded */
    onMounted(async () => {
        if (computed(() => store.getters.getAuth).value) await getVault()  
    })

    /**Selects all the records in the filtered list */
    function selectAll() {
        selectedItems.value = []
        if (!allSelected.value) {
            filteredList.value.forEach(item => {
                selectedItems.value.push(item._id)
            });
        }
    }

    /**watches the selectedItems array for any change and when a change occurs executes the function */
    watch(selectedItems, () => {
        if (selectedItems.value.length == filteredList.value.length && selectedItems.value.length > 0) {
            allSelected.value = true
        }
    })

    /**watches the lastOP  for any change and when a change occurs executes the function */
    watch(lastOP, () => {
        setTimeout(() => lastOP.value = false, 1200);
    })

    /**Function called when user selects a record */
    function select() {
        allSelected.value = false
    }

    /**Function that does a specific action when a certain option is selected */
    function optionExe(index, val) {
        switch(index){
            case 0: 
                navigator.clipboard.writeText(val.email)
                break;
            case 1:
                navigator.clipboard.writeText(val.password)
                break;
            case 2:
                deleteRecord([val._id])
                break;
        }
        
    }

    /**Deletes the selected records from user vault*/
    async function deleteSelected() {
        if (selectedItems.value.length > 0) await deleteRecord(selectedItems.value)
    }

    /**Adds the selected records to a folder */
    async function addRemoveSelectedToFromFolders(b) {
        //create one for elements too
        if (selectedItems.value.length <= 0) return
        if(!b) addRemoveToFromFolder.value.map(async folder => await addRecordsToFolders(folder, selectedItems.value))
        else selectedItems.value.map(x => addRemoveToFromFolder.value.map(folder => removeRecordsFromFolders(folder, x)))
            
        
        selectedItems.value = []
        allSelected.value = false
        addRemoveToFromFolder.value = []
        addRemoveToFromFolderDialog.value = false
    }

    /**Shows the details of a record selected from all the records */
    function showDetails(item) {
        recordSelected.value = item;
        dialog.value = true;
    }

    /**A sub-function that resets everything inside the function before filtering */
    function resetSubFunctionFilter() {
        allSelected.value = false
        selectedItems.value = []
        filteredList.value = []
    }

    /**Filters the records by elements and shows them to user */
    function filterTags(filterTag) {
        lastFilter.value = filterTag
        resetSubFunctionFilter()
        if (filterTag == 'All') {
            filteredList.value = vault.value
        }
        if (filterTag == 'Favorite') {
            vault.value.map(element => {
                if(element.favorite) filteredList.value.push(element)
            })
        }
        else {
            vault.value.map(element => {
                if (element.tags == filterTag) {
                    filteredList.value.push(element)
                }
            })
        }
    }

    /**Filters the records by folders and shows them to user */
    function filterFolders(filterFolder) {
        lastFilter.value = filterFolder
        resetSubFunctionFilter()
        folders.value.map(folder => {
            if (folder.k == filterFolder) {
                var i = 0
                while (i < folder.v.length) {
                    vault.value.map(e => {
                        if (folder.v[i] == e._id) {
                            filteredList.value.push(e)
                        }
                    })
                    i++
                }
            }
        })
    }

    /**Calls the back-end to retrieve the user vault */
    async function getVault() {
        vault.value = []
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if (response.status == 200) {
            const data = await response.json()
            vault.value = data.vault
            await getFolders()
            filterTags("All")
            lastOP.value = true
        }
        else lastOP.value = false
        
    }

    /**Calls the back-end to retrieve user created folders */
    async function getFolders() {
        folders.value = []
        const response = await fetch(process.env.VUE_APP_FOLDER, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if(response.status == 200) {
            const data = await response.json()
            for (const [key, value] of Object.entries(data.folders)) {
                if(folders.value.find(x => x.k == key) == undefined){
                    folders.value.push({
                        k: key,
                        v: value
                    })
                }
                
            }
        }
    }

    /**Calls the back-end to add a newly created folder */
    async function addFolder() {
        const response = await fetch(process.env.VUE_APP_FOLDER, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify({ "newfolder": folderName.value })
        })
        if (response.status == 200) {
            await getVault()
            lastOP.value = true
            folderName.value = ""
            folderDialog.value = false
        }
    }

    /**Calls the back-end to change the name of a user created folder */
    async function changeName() {
        const response = await fetch(process.env.VUE_APP_FOLDER + "/change", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify({ "oldName": folderOldName.value, "newName": folderName.value })
        })
        if (response.status == 200) {
            await getVault()
            lastOP.value = true
            folderName.value = ""
            folderDialog.value = false
        }
    }

    /**Calls the back-end to remove a user created folder */
    async function removeFolder(folder) {
        const response = await fetch(process.env.VUE_APP_FOLDER + '/' + folder, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if (response.status == 200) await getVault()
    }

    /**Calls the back-end to update a record */
    async function update() {
        let _id = recordSelected.value._id
        delete recordSelected.value._id
        delete recordSelected.value.user_id
        await fetch(process.env.VUE_APP_VAULT + '/' + _id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(recordSelected.value)
        })
        await getVault()
        dialog.value = false
    }

    /**Validates the form before sending it to back-end */
    async function checkAddRecord() {
        if (await v$.value.$validate()) await addRecord()
    }

    /**Calls the back-end to add a new record */
    async function addRecord() {
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(data)
        })
        if(response.status == 201){
            await getVault()
            addRemoveToFromFolder.value.map(async folder => await addRecordsToFolders(folder, [vault.value.filter(e => e.name == data.name)[0]._id]))
            lastOP.value = true
        }
        clearData()
        selectedItems.value = []
        dialog.value = false
    }

    /**Calls the back-end to add a record/s to folder/s */
    async function addRecordsToFolders(folder, record){
        const response = await fetch(process.env.VUE_APP_FOLDER + '/element', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify({"folder": folder, "element": record})
        })
        lastOP.value = response.status === 200
        await getFolders()
    } 

    /**Clears the form data fields and reset the form validator */
    function clearData() {
        data.email = ''
        data.name = ''
        data.link = ''
        data.notes = ''
        data.password = ''
        data.tags = []
        data.favorite = false
        data.card_holder = ''
        data.expiry = null
        data.cvv = ''
        data.card_number = null
        data.id_number = null
        data.id_holder = ''
        addRemoveToFromFolder.value = []
        v$.value.$reset()
    }

    /**Calls the back-end to delete a/multiple record/s */
    async function deleteRecord(id) {
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            credentials: 'include',
            body: JSON.stringify({ "elements": id })
        })
        if(response.status == 200){
            id.map(x => {
                folders.value.map(folder => removeRecordsFromFolders(folder.k, x))
            })
        }
        await getVault()
        
    }

    /**Calls the back-end to remove a record from a folder */
    async function removeRecordsFromFolders(folder, record){
        const response = await fetch(process.env.VUE_APP_FOLDER + '/element/' + folder + '&' + record, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            }
        })
        lastOP.value = response.status === 200
        await getFolders()
        filterTags("All")
    }

    function addRemoveToFromFav(item){
        item.favorite = !item.favorite
        recordSelected.value = item;
        update()
    }
</script>

<template>
    <v-progress-linear v-if="lastOP" :color="loadingColor" indeterminate></v-progress-linear>
    <v-progress-linear v-else color="white"></v-progress-linear>
    <v-container class="mt-16 unselectable">
        <v-row>
            <!--1st-->
            <v-col cols="4" xl="4" class="d-flex flex-column">
                <v-row>
                    <v-col md="6" class="d-none d-xl-flex"></v-col>
                    <v-col cols="12" md="6">
                        <div rounded class="pa-xl-6 mx-auto" max-width="400">
                            <div class="px-xl-2 text-h6 font-weight-bold">
                                Filter
                                <v-divider thickness="1"></v-divider>
                            </div>

                            <div class="px-xl-2 text-subtitle-1 font-weight-light">
                                <div>
                                    All tags
                                </div>
                                <div class="pl-xl-6 popOut changePointer" v-if="lastFilter == 'All'" style="color: #2196f3;" @click="filterTags('All')">
                                    <v-icon size="small" icon="mdi-set-all"></v-icon>
                                    All
                                </div>
                                <div class="pl-xl-6 popOut changePointer" v-else @click="filterTags('All')">
                                    <v-icon size="small" icon="mdi-set-all"></v-icon>
                                    All
                                </div>
                                <div class="pl-xl-6 popOut changePointer" v-if="lastFilter == 'Favorite'" style="color: #2196f3;" @click="filterTags('Favorite')">
                                    <v-icon size="small" icon="mdi-star"></v-icon>
                                    Favorite
                                </div>
                                <div class="pl-xl-6 popOut changePointer" v-else @click="filterTags('Favorite')">
                                    <v-icon size="small" icon="mdi-star"></v-icon>
                                    Favorite
                                </div>
                                <div class="pl-xl-6 popOut changePointer" @click="filterTags(tag.text)" v-for="tag in tags" :key="tag.text">
                                    <div v-if="lastFilter == tag.text" style="color: #2196f3">
                                        <v-icon size="small" :icon="tag.icon"></v-icon>
                                        {{ tag.text }}
                                    </div>
                                    <div v-else>
                                        <v-icon size="small" :icon="tag.icon"></v-icon>
                                        {{ tag.text }}
                                    </div>
                                </div>
                            </div>
                            <v-divider thickness="1"></v-divider>
                            <div class="px-xl-2 pt-1 text-subtitle-1 font-weight-light">
                                <div class="d-flex">
                                    <div>
                                        All folders
                                    </div>
                                    <v-spacer />
                                    <div class="align-center popOut">
                                        <v-icon size="x-small" icon="mdi-plus" @click="folderOption = true, folderDialog = true" />
                                    </div>
                                </div>
                                <div class="pl-xl-6 d-flex" v-for="folder in folders" :key="folder.k">
                                        <div class="popOut changePointer" v-if="lastFilter == folder.k" style="color: #2196f3" @click="filterFolders(folder.k)">
                                            <v-icon size="small" icon="mdi-folder"></v-icon>
                                            {{ folder.k }}
                                        </div>
                                        <div class="popOut changePointer" v-else @click="filterFolders(folder.k)">
                                            <v-icon size="small" icon="mdi-folder"></v-icon>
                                            {{ folder.k }}
                                        </div>
                                        <v-spacer></v-spacer>
                                        <div class="align-center justify-end popOut">
                                            <v-icon size="x-small" icon="mdi-pencil-outline"
                                                @click="folderOption = false, folderDialog = true, folderOldName = folder.k" />
                                        </div>
                                        <div class="align-center justify-end popOut">
                                            <v-icon size="x-small" icon="mdi-minus" @click="removeFolder(folder.k)" />
                                        </div>
                                </div>
                            </div>
                        </div>
                    </v-col>
                </v-row>
            </v-col>

            <!--2nd-->
            <v-col cols="8" xl="4" class="d-flex flex-column">
                <!--DASHBOARD ROW-->
                <v-row>
                    <v-col cols="12" sm="6">
                        <div class="text-h3 font-weight-light">Dashboard 
                            <div class="text-h6 font-weight-light d-flex align-center">
                                <v-icon size="small" icon="mdi-folder"></v-icon> 
                                <div class="pl-2">{{ lastFilter }}</div>
                            </div>
                        </div>
                    </v-col>
                    <v-col class="d-flex justify-sm-end" cols="12" sm="6">
                        <div>
                            <VSheet class="ma-1 pa-1">
                                <v-btn color="#2196f3" style="color: white;" prepend-icon="mdi-plus"
                                    @click="dialog = true, dialogOption = true">
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
                                    <v-list-item-title>Delete selected records ({{ selectedItems.length }})</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="addRemoveToFromFolderDialog = true, addRemoveToFromFolderOption = false">
                                    <v-list-item-title>Add selected records to a folder ({{ selectedItems.length }})</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="addRemoveToFromFolderDialog = true, addRemoveToFromFolderOption = true">
                                    <v-list-item-title>Remove selected records from a folder ({{ selectedItems.length }})</v-list-item-title>
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
                                <v-checkbox class="mt-5" v-model="selectedItems" @click="select()"
                                    :value="item._id"></v-checkbox>
                            </v-col>
                            <v-col cols="7">
                                <div @click="dialogOption = false, showDetails(item)" class="popOut text-start align-center d-flex flex-row changePointer">
                                    <div v-for="tag in tags" :key="tag.text">
                                        <v-icon v-if="item.tags == tag.text" size="small" :icon="tag.icon"></v-icon>
                                    </div>
                                    <div class="pa-3 text-h6">
                                        {{ item.name }}
                                        <div class="text-caption">
                                            {{ item.email }}
                                        </div>
                                    </div>
                                </div>
                            </v-col>
                            <v-col cols="1">
                                <v-icon class="popOut" size="small" icon="mdi-star" v-if="item.favorite" color="#2196f3" @click="addRemoveToFromFav(item, true)"></v-icon>
                                <v-icon class="popOut" size="small" icon="mdi-star" v-else @click="addRemoveToFromFav(item, false)"></v-icon>
                            </v-col>
                            <v-col cols="2">
                                <v-menu>
                                    <template v-slot:activator="{ props }">
                                        <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                                    </template>
                                    <v-list>
                                        <v-list-item v-for="(option, index) in options" :key="index" :value="index"
                                            @click="optionExe(index, item)">
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
            <v-col cols="0" xl="4">
            </v-col>
        </v-row>
    </v-container>

    <v-dialog persistent v-model="dialog" width="1024">
        <!--Modify record-->
        <v-card v-if="!dialogOption">
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Details
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field label="Name" v-model="recordSelected.name" />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-select v-model="recordSelected.tags" :items="tags" item-title="text" item-value="text"
                                label="Tags" chips/>
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Accounts'" cols="12" sm="6">
                            <v-text-field label="Email" v-model="recordSelected.email" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Accounts'" cols="12" sm="6">
                            <v-text-field label="Password" v-model="recordSelected.password" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Accounts'" cols="12">
                            <v-text-field label="Link" v-model="recordSelected.link" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Card Holder Name" v-model="recordSelected.card_holder" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Card Number" v-model="recordSelected.card_number" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Expiry" v-model="recordSelected.expiry" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="CVV" v-model="recordSelected.cvv" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Identity'" cols="12" sm="6">
                            <v-text-field label="ID Holder Name" v-model="recordSelected.id_holder" />
                        </v-col>
                        <v-col v-if="recordSelected.tags == 'Identity'" cols="12" sm="6">
                            <v-text-field label="ID Number" v-model="recordSelected.id_number" />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea label="Notes/Details" v-model="recordSelected.notes"></v-textarea>
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
        <!--Add a record-->
        <v-card v-else>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Add a record
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Name" v-model="data.name" />
                            <div class="text-caption text-red" v-for="error in v$.name.$errors" :key="error.$uid">
                                {{ data.name + error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="addRemoveToFromFolder" :items="folders" item-title="k" item-value="k" label="Folders"
                                chips multiple />
                        </v-col>
                        <v-col cols="12" sm="6" md="3">
                            <v-select v-model="data.tags" :items="tags" item-title="text" item-value="text" label="Tags"
                                chips/>
                        </v-col>
                        <v-col v-if="data.tags == 'Accounts'" cols="12" sm="6">
                            <v-text-field label="Email" v-model="data.email" />
                        </v-col>
                        <v-col v-if="data.tags == 'Accounts'" cols="12" sm="6">
                            <v-text-field label="Password" v-model="data.password" />
                        </v-col>
                        <v-col v-if="data.tags == 'Accounts'" cols="12">
                            <v-text-field label="Link" v-model="data.link" />
                        </v-col>
                        <v-col v-if="data.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Card Holder Name" v-model="data.card_holder" />
                        </v-col>
                        <v-col v-if="data.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Card Number" v-model="data.card_number" />
                        </v-col>
                        <v-col v-if="data.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="Expiry" v-model="data.expiry" />
                        </v-col>
                        <v-col v-if="data.tags == 'Credit Card'" cols="12" sm="6">
                            <v-text-field label="CVV" v-model="data.cvv" />
                        </v-col>
                        <v-col v-if="data.tags == 'Identity'" cols="12" sm="6">
                            <v-text-field label="ID Holder Name" v-model="data.id_holder" />
                        </v-col>
                        <v-col v-if="data.tags == 'Identity'" cols="12" sm="6">
                            <v-text-field label="ID Number" v-model="data.id_number" />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea label="Notes/Details" v-model="data.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialog = false">
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
                <div v-if="folderOption" class="mt-1 pt-1 text-h5">
                    Add a new folder
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    New name
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
                <v-btn v-if="folderOption" color="blue-darken-1" variant="text" @click="addFolder()">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="changeName()">
                    Change
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="addRemoveToFromFolderDialog" width="500">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div v-if="!addRemoveToFromFolderOption" class="mt-1 pt-1 text-h5">
                    Select folders to add to
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    Select folders to remove from
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-select v-model="addRemoveToFromFolder" :items="folders" item-title="k" item-value="k" label="Folders"
                                chips multiple />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="addRemoveToFromFolderDialog = false, selectedItems = [], addRemoveToFromFolder = []">
                    Close
                </v-btn>
                <v-btn v-if="!addRemoveToFromFolderOption" color="blue-darken-1" variant="text" @click="addRemoveSelectedToFromFolders(false)">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="addRemoveSelectedToFromFolders(true)">
                    Remove 
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped> 
.changePointer {
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
</style>