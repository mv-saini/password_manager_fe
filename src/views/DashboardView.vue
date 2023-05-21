<script setup>
    import { computed } from '@vue/reactivity';
    import { onMounted, ref, watch, reactive } from 'vue';
    import { useStore } from 'vuex';
    import { useVuelidate } from '@vuelidate/core'
    import { required, helpers, email, minLength, maxLength } from '@vuelidate/validators'
    import { tokenNotValid, refreshToken } from '@/SharedJS/TokenJS/RefreshInvalidToken';

    /**Used to access vuex store */
    const store = useStore()

    /**An array that contains all the records of the user vault */
    const vault = ref([])

    /**Contains the record selected by the user */
    const recordSelected = ref(null)

    /**Keeps the selected records id and userid */
    const recordSelectedIDs = ref({})

    /**Dialog box for account add or modification */
    const dialogAccounts = ref(false)

    /**Dialog box for credit card add or modification */
    const dialogCC = ref(false)

    /**Dialog box for identity card add or modification */
    const dialogID = ref(false)

    /**Dialog box for notes add or modification */
    const dialogNotes = ref(false)

    /**Toggle between modify or add in dialog boxes */
    const modification = ref(false)

    /**Opens the dialog box to add a new folder or to change the name of a existing folder */
    const folderDialog = ref(false)

    /**Determines if the user wants to add a new folder or to change the name */
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

    /**To remember the last filter */
    const lastFilter = ref("All")

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

    /**An array of objects that contains the options for each Account record */
    const optionsAccounts = [
        {
            title: 'Copy Email',
            id: 1
        },
        {
            title: 'Copy Password',
            id: 2
        }
    ]

    /**An array of objects that contains the options for each Credit card record */
    const optionsCC = [
        {
            title: 'Copy Card Number',
            id: 3
        },
        {
            title: 'Copy Card Holder Name',
            id: 4
        }
    ]

    /**An array of objects that contains the options for each Identity card record */
    const optionsIdentity = [
        {
            title: 'Copy Identity Number',
            id: 5
        },
        {
            title: 'Copy Identity Holder Name',
            id: 6
        }
    ]

    /**An object that contains the values to be added or modified as an account */
    const dataAccount = reactive({
        name: '',
        email: '',
        password: '',
        link: '',
        notes: '',
        tags: 'Accounts',
        favorite: false,
    })

    /**An object that contains the values to be added or modified as a credit card */
    const dataCC = reactive({
        name: '',
        notes: '',
        tags: 'Credit Card',
        favorite: false,
        card_holder: '',
        expiry: null,
        cvv: '',
        card_number: null,
    })

    /**An object that contains the values to be added or modified as an identity card */
   const dataID = reactive({
        name: '',
        notes: '',
        tags: 'Identity',
        favorite: false,
        id_number: null,
        id_holder: ''
    })

    /**An object that contains the values to be added or modified as a note */
    const dataNotes = reactive({
        name: '',
        notes: '',
        tags: 'Notes',
        favorite: false,
    })

    /**An array that contains the names of folders that will contain the record*/
    const addToFolder = ref([])

    /**Shows the dialog box for adding a record/s to a folder/s  */
    const addToFolderDialog = ref(false)

    /**Rules that need to be met before submitting an account */
    const rulesAccount = computed(() => {
        return {
            name: {
                required: helpers.withMessage('Name is required', required),
            },
            email: { 
                required: helpers.withMessage('Email is required', required), 
                email : helpers.withMessage(' is not a valid email address', email)
            },
            password: { 
                required: helpers.withMessage('Password is required', required), 
            },
        }
    })

    /**Rules that need to be met before submitting a credit card */
    const rulesCC = computed(() => {
        return {
            name: {
                required: helpers.withMessage('Name is required', required),
            },
            card_holder: { required: helpers.withMessage('Card holder name is required', required), 
                valid: helpers.withMessage('Card holder name must only contain letters',
                function(value) {
                    const containsLetters = /[A-Za-z]/.test(value)
                    const containsNumber = /[0-9]/.test(value)
                    const containsSpecial = /[#?!@$£%^&*)("'=_.,;°§ç+}{/><|:@-]/.test(value)
                    return containsLetters && !containsNumber && !containsSpecial
                })
            },
            card_number: { required: helpers.withMessage('Card number is required', required),
                minLength: helpers.withMessage('Invalid card number', minLength(16)),
                maxLength: helpers.withMessage('Invalid card number', maxLength(16)),
                valid: helpers.withMessage('Card number must contain only numbers',
                function(value) {
                    const containsUppercase = /[A-Z]/.test(value)
                    const containsLowercase = /[a-z]/.test(value)
                    const containsNumber = /[0-9]/.test(value)
                    const containsSpecial = /[#?!@$£%^&*)("'=_.,;°§ç+}{/><|:@-]/.test(value)
                    return !containsUppercase && !containsLowercase && containsNumber && !containsSpecial
                })
            },
            cvv: { required: helpers.withMessage('CVV is required', required),
                minLength: helpers.withMessage('Invalid CVV', minLength(3)),
                maxLength: helpers.withMessage('Invalid CVV', maxLength(4)),
                valid: helpers.withMessage('CVV must contain only numbers',
                function(value) {
                    const containsUppercase = /[A-Z]/.test(value)
                    const containsLowercase = /[a-z]/.test(value)
                    const containsNumber = /[0-9]/.test(value)
                    const containsSpecial = /[#?!@$£%^&*)("'=_.,;°§ç+}{/><|:@-]/.test(value)
                    return !containsUppercase && !containsLowercase && containsNumber && !containsSpecial
                })
            },
            expiry: { required: helpers.withMessage('Expiration is required', required),
                valid: helpers.withMessage('Expiration invalid',
                function(value) {
                    const matches = /^(0[1-9]|1[0-2])\/?([0-9]{2})$/.test(value)
                    return matches
                })
            },
        }
    })

    /**Rules that need to be met before submitting an identity card */
    const rulesID = computed(() => {
        return {
            name: {
                required: helpers.withMessage('Name is required', required),
            },
            id_holder: { required: helpers.withMessage('ID holder name is required', required), 
                valid: helpers.withMessage('ID holder name must only contain letters',
                function(value) {
                    const containsLetters = /[A-Za-z]/.test(value)
                    const containsNumber = /[0-9]/.test(value)
                    const containsSpecial = /[#?!@$£%^&*)("'=_.,;°§ç+}{/><|:@-]/.test(value)
                    return containsLetters && !containsNumber && !containsSpecial
                })
            },
            id_number: { required: helpers.withMessage('ID number is required', required),
                valid: helpers.withMessage('Invalid ID number',
                function(value) {
                    const alphanumeric = /[A-Za-z0-9]/.test(value)
                    const containsSpecial = /[#?!@$£%^&*)("'=_.,;°§ç+}{/><|:@-]/.test(value)
                    return alphanumeric && !containsSpecial
                })
            },
        }
    })

    /**Rules that need to be met before submitting a note */
    const rulesNotes = computed(() => {
        return {
            name: {
                required: helpers.withMessage('Name is required', required),
            },
        }
    })

    /**Validates the data by using rules for account */
    const vAccount$ = useVuelidate(rulesAccount, dataAccount)

    /**Validates the data by using rules for credit card */
    const vCC$ = useVuelidate(rulesCC, dataCC)

    /**Validates the data by using rules for identity card */
    const vID$ = useVuelidate(rulesID, dataID)

    /**Validates the data by using rules for note */
    const vNotes$ = useVuelidate(rulesNotes, dataNotes)

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
        if (selectedItems.value.length == filteredList.value.length && selectedItems.value.length > 0) allSelected.value = true
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
        switch (index) {
            case 0:
                deleteRecord('?elements[]=' + val._id)
                break;
            case 1:
                navigator.clipboard.writeText(val.email)
                break;
            case 2:
                navigator.clipboard.writeText(val.password)
                break;
            case 3:
                navigator.clipboard.writeText(val.card_number)
                break;
            case 4:
                navigator.clipboard.writeText(val.card_holder)
                break;
            case 5:
                navigator.clipboard.writeText(val.id_number)
                break;
            case 6:
                navigator.clipboard.writeText(val.id_holder)
                break;
        }
    }

    /**Deletes the selected records from user vault*/
    async function deleteSelected() {
        if (selectedItems.value.length > 0){ 
            const format = '&elements[]='
            let query = '?elements[]=' + selectedItems.value[0]
            selectedItems.value.splice(0, 1)
            selectedItems.value.map(items => query = query + format + items)
            await deleteRecord(query)
        }
    }

    /**Adds the selected records to a folder */
    async function addSelectedToFolders() {
        if (selectedItems.value.length <= 0) return
        addToFolder.value.map(async folder => await addRecordsToFolders(folder, selectedItems.value))

        selectedItems.value = []
        allSelected.value = false
        addToFolder.value = []
        addToFolderDialog.value = false
    }

    async function removeAllRecordsFromAFolder(){
        filteredList.value.map(async el => await removeRecordsFromFolders(lastFilter.value, el._id))
    }
    
    async function removeThisRecordFromAFolder(id){
        await removeRecordsFromFolders(lastFilter.value, id)
    }

    /**Shows the details of a record selected from all the records */
    function showDetails(item) {
        modification.value = true
        recordSelectedIDs.value._id = item._id
        recordSelectedIDs.value.user_id = item.user_id
        switch(item.tags){
            case 'Accounts':
                toggleAccount(item)
                break;
            case 'Credit Card': 
                toggleCC(item)
                break;
            case 'Identity': 
                toggleID(item)
                break;
            case 'Notes': 
                toggleNotes(item)
                break;
        }
        
    }

    function toggleAccount(item){
        dataAccount.email = item.email
        dataAccount.password = item.password
        dataAccount.favorite = item.favorite
        dataAccount.link = item.link
        dataAccount.notes = item.notes
        dataAccount.name = item.name
        dataAccount.tags = item.tags
        dialogAccounts.value = true;
    }

    function toggleCC(item){
        dataCC.card_holder = item.card_holder
        dataCC.card_number = item.card_number
        dataCC.cvv = item.cvv
        dataCC.expiry = item.expiry
        dataCC.notes = item.notes
        dataCC.name = item.name
        dataCC.tags = item.tags
        dialogCC.value = true;
    }

    function toggleID(item){
        dataID.id_holder = item.id_holder
        dataID.id_number = item.id_number
        dataID.notes = item.notes
        dataID.name = item.name
        dataID.tags = item.tags
        dialogID.value = true;
    }

    function toggleNotes(item){
        dataNotes.notes = item.notes
        dataNotes.name = item.name
        dataNotes.tags = item.tags
        dialogNotes.value = true;
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
                if (element.favorite) filteredList.value.push(element)
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
            if(!belongsFolder()){ 
                if(belongsTags) filterTags(lastFilter.value)
                else filterTags('All')
            }
            else filterFolders(lastFilter.value)
            lastOP.value = true
        }
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await getVault()
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
        if (response.status == 200) {
            const data = await response.json()
            for (const [key, value] of Object.entries(data.folders)) {
                if (folders.value.find(x => x.k == key) == undefined) {
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
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await addFolder()
        }
    }

    /**Calls the back-end to change the name of a user created folder */
    async function changeName() {
        const response = await fetch(process.env.VUE_APP_FOLDER, {
            method: 'PUT',
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
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await changeName()
        }
    }

    /**Calls the back-end to remove a user created folder */
    async function removeFolder(folder) {
        const response = await fetch(process.env.VUE_APP_FOLDER + '?ids[]=' + folder, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
        })
        if (response.status == 200) await getVault()
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await removeFolder(folder)
        }
        filterTags('All')
    }

    async function checkUpdate(data){
        recordSelected.value = data
        if(data.tags == 'Accounts' && await vAccount$.value.$validate()) await update()
        if(data.tags == 'Credit Card' && await vCC$.value.$validate()) await update()
        if(data.tags == 'Identity' && await vID$.value.$validate()) await update()
        if(data.tags == 'Notes' && await vNotes$.value.$validate()) await update()
    }

    /**Calls the back-end to update a record */
    async function update() {
        const response = await fetch(process.env.VUE_APP_VAULT + '?element=' + recordSelectedIDs.value._id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(recordSelected.value)
        })
        if (response.status == 200) {
            await getVault()
        }
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await update()
        }
        modification.value = false
        resetDialogs(recordSelected.value.tags)
    }

    /**Validates the form before sending it to back-end */
    async function checkAddRecord(data) {
        if(data.tags == 'Accounts' && await vAccount$.value.$validate()) await addRecord(data)
        if(data.tags == 'Credit Card' && await vCC$.value.$validate()) await addRecord(data)
        if(data.tags == 'Identity' && await vID$.value.$validate()) await addRecord(data)
        if(data.tags == 'Notes' && await vNotes$.value.$validate()) await addRecord(data)
    }

    /**Calls the back-end to add a new record */
    async function addRecord(data) {
        const response = await fetch(process.env.VUE_APP_VAULT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify(data)
        })
        if (response.status == 200) {
            await getVault()
            const resData = await response.json()
            addToFolder.value.map(async folder => await addRecordsToFolders(folder, [resData.id]))
            lastOP.value = true
        }
        else if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await addRecord()
        }
        selectedItems.value = []
        resetDialogs(data.tags)
    }

    function resetDialogs(tag){
        switch(tag){
            case 'Accounts':
                dialogAccounts.value = false
                clearDataAccounts()
                break;
            case 'Credit Card':
                dialogCC.value = false
                clearDataCC()
                break;
            case 'Identity':
                dialogID.value = false
                clearDataID()
                break;
            case 'Notes':
                dialogNotes.value = false
                clearDataNotes()
                break;
        }
    }

    /**Calls the back-end to add a record/s to folder/s */
    async function addRecordsToFolders(folder, record) {
        const response = await fetch(process.env.VUE_APP_FOLDER + '/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            body: JSON.stringify({ "folder": folder, "element": record })
        })
        lastOP.value = response.status == 200
        if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await addRecordsToFolders(folder, record)
        }
        await getFolders()
        if(!belongsFolder()) filterTags(lastFilter.value)
        else filterFolders(lastFilter.value)
    }

    /**Clears the form data fields and reset the form validator */
    function clearDataAccounts() {
        dataAccount.email = ''
        dataAccount.name = ''
        dataAccount.link = ''
        dataAccount.notes = ''
        dataAccount.password = ''
        addToFolder.value = []
        vAccount$.value.$reset()
    }

    function clearDataCC() {
        dataCC.card_holder = ''
        dataCC.card_number = ''
        dataCC.cvv = ''
        dataCC.expiry = ''
        dataCC.name = ''
        dataCC.notes = ''
        addToFolder.value = []
        vCC$.value.$reset()
    }

    function clearDataID() {
        dataID.id_holder = ''
        dataID.id_number = ''
        dataID.name = ''
        dataID.notes = ''
        addToFolder.value = []
        vID$.value.$reset()
    }

    function clearDataNotes() {
        dataNotes.name = ''
        dataNotes.notes = ''
        addToFolder.value = []
        vNotes$.value.$reset()
    }

    /**Calls the back-end to delete a/multiple record/s */
    async function deleteRecord(query) {
        const response = await fetch(process.env.VUE_APP_VAULT + query, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value,
            },
            credentials: 'include',
        })
        lastOP.value = response.status == 200
        if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await deleteRecord(query)
        }
        await getVault()
    }

    /**Calls the back-end to remove a record from a folder */
    async function removeRecordsFromFolders(folder, record) {
        const response = await fetch(process.env.VUE_APP_FOLDER + '/remove?folder=' + folder + '&element=' + record, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + computed(() => store.getters.getToken).value, }
        })
        lastOP.value = response.status == 200
        if (response.status == 403) tokenNotValid()
        else if (response.status == 498) {
            await refreshToken()
            await removeRecordsFromFolders(folder, record)
        }
        await getFolders()
        if(!belongsFolder()) filterTags(lastFilter.value)
        else filterFolders(lastFilter.value)
    }

    async function addRemoveToFromFav(item) {
        item.favorite = !item.favorite
        recordSelected.value = item;
        recordSelectedIDs.value._id = item._id
        await update()
    }

    function belongsTags(){
        if('All' == lastFilter.value) return true
        else if('Favorite' == lastFilter.value) return true
        let found = false
        tags.map(tag => {
            if(tag.text == lastFilter.value){ 
                found = true
                return
            }
        })
        return found
    }

    function belongsFolder(){
        let found = false
        folders.value.map(folder => {
            if(folder.k == lastFilter.value){ 
                found = true
                return
            }
        })
        return found
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
                                <div class="pl-xl-6 popOut changePointer d-flex align-center" v-if="lastFilter == 'All'" 
                                    style="color: #2196f3;" @click="filterTags('All')">
                                    <v-icon size="small" icon="mdi-set-all" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                    All
                                </div>
                                <div class="pl-xl-6 popOut changePointer d-flex align-center" v-else @click="filterTags('All')">
                                    <v-icon size="small" icon="mdi-set-all" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                    All
                                </div>
                                <div class="pl-xl-6 popOut changePointer d-flex align-center" v-if="lastFilter == 'Favorite'" style="color: #2196f3;" @click="filterTags('Favorite')">
                                    <v-icon size="small" icon="mdi-star" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                    Favorite
                                </div>
                                <div class="pl-xl-6 popOut changePointer d-flex align-center" v-else
                                    @click="filterTags('Favorite')">
                                    <v-icon size="small" icon="mdi-star" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                    Favorite
                                </div>
                                <div class="pl-xl-6 popOut changePointer" @click="filterTags(tag.text)" v-for="tag in tags"
                                    :key="tag.text">
                                    <div v-if="lastFilter == tag.text" style="color: #2196f3" class="d-flex align-center">
                                        <v-icon size="small" :icon="tag.icon" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                        {{ tag.text }}
                                    </div>
                                    <div class="d-flex align-center" v-else>
                                        <v-icon size="small" :icon="tag.icon" class="d-none d-sm-flex pr-sm-3"></v-icon>
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
                                        <v-icon size="x-small" icon="mdi-plus"
                                            @click="folderOption = true, folderDialog = true" />
                                    </div>
                                </div>
                                <div class="pl-xl-6 d-flex" v-for="folder in folders" :key="folder.k">
                                    <div class="popOut changePointer d-flex align-center" v-if="lastFilter == folder.k"
                                        style="color: #2196f3" @click="filterFolders(folder.k)">
                                        <v-icon size="small" icon="mdi-folder" class="d-none d-sm-flex pr-sm-3"></v-icon>
                                        {{ folder.k }}
                                    </div>
                                    <div class="popOut changePointer d-flex align-center" v-else
                                        @click="filterFolders(folder.k)">
                                        <v-icon size="small" icon="mdi-folder" class="d-none d-sm-flex pr-sm-3"></v-icon>
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
                    <v-col class="d-flex justify-end" cols="12" md="6">
                        <div>
                            <v-menu class="ma-1 pa-1 changePointer" transition="scale-transition">
                                <template v-slot:activator="{ props }">
                                    <v-btn color="#2196f3" v-bind="props" append-icon="mdi-plus">
                                        Add a record
                                    </v-btn>
                                </template>

                                <v-list>
                                    <v-list-item>
                                        <v-list-item-title class="hoverColor" @click="dialogAccounts = true">Add an account</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title class="hoverColor" @click="dialogCC = true">Add a credit card</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title class="hoverColor" @click="dialogID = true">Add an identity card</v-list-item-title>
                                    </v-list-item>
                                    <v-list-item>
                                        <v-list-item-title class="hoverColor" @click="dialogNotes = true">Add a note</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>
                    </v-col>
                    <v-divider thickness="1" class="border-opacity-100"></v-divider>
                </v-row>

                <!--NAME ROW-->
                <v-row class="d-flex justify-center align-center">
                    <v-col cols="2">
                        <v-checkbox class="mt-5" @click="selectAll()" v-model="allSelected"></v-checkbox>
                    </v-col>
                    <v-col cols="7" sm="8">
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
                                    <v-list-item-title>Delete selected records ({{ selectedItems.length
                                    }})</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="addToFolderDialog = true">
                                    <v-list-item-title>Add selected records to a folder ({{ selectedItems.length
                                    }})</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="belongsFolder() && filteredList.length > 0" @click="removeAllRecordsFromAFolder()">
                                    <v-list-item-title>Remove all records from {{ lastFilter }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                    <v-divider :thickness="1" class="border-opacity-100"></v-divider>
                </v-row>

                <!--EMPTY RECORDS ROW-->
                <v-row v-if="filteredList.length == 0" class="d-flex justify-center align-center">
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

                <!--RECORDS ROW-->
                <v-row v-for="item in filteredList" :key="item._id" v-else class="d-flex justify-center align-center">
                    <v-col cols="2">
                        <v-checkbox class="mt-5" v-model="selectedItems" @click="select()" :value="item._id"></v-checkbox>
                    </v-col>
                    <v-col cols="6" sm="7">
                        <div @click="showDetails(item)"
                            class="popOut text-start align-center d-flex flex-row changePointer">
                            <div v-for="tag in tags" :key="tag.text">
                                <v-icon v-if="item.tags == tag.text" size="small" :icon="tag.icon"
                                    class="d-none d-sm-flex"></v-icon>
                            </div>
                            <div class="pa-sm-3 text-h6">
                                {{ item.name }}
                                <div v-if="item.tags == 'Accounts'" class="text-caption">
                                    {{ item.email }}
                                </div>
                            </div>
                        </div>
                    </v-col>
                    <v-col cols="1">
                        <v-icon class="popOut" size="small" icon="mdi-star" v-if="item.favorite" color="#2196f3"
                            @click="addRemoveToFromFav(item, true)"></v-icon>
                        <v-icon class="popOut" size="small" icon="mdi-star" v-else
                            @click="addRemoveToFromFav(item, false)"></v-icon>
                    </v-col>
                    <v-col cols="2">
                        <v-menu v-if="item.tags == 'Accounts'">
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="option in optionsAccounts" :key="option.id" :value="option.id"
                                    @click="optionExe(option.id, item)">
                                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="optionExe(0, item)">
                                    <v-list-item-title>Remove Record</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="addToFolderDialog = true, selectedItems.push(item._id)">
                                    <v-list-item-title>Add Record to a folder</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="belongsFolder()" @click="removeThisRecordFromAFolder(item._id)">
                                    <v-list-item-title>Remove Record from {{ lastFilter }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu v-if="item.tags == 'Credit Card'">
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="option in optionsCC" :key="option.id" :value="option.id"
                                    @click="optionExe(option.id, item)">
                                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="optionExe(0, item)">
                                    <v-list-item-title>Remove Record</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="addToFolderDialog = true, selectedItems.push(item._id)">
                                    <v-list-item-title>Add Record to a folder</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="belongsFolder()" @click="removeThisRecordFromAFolder(item._id)">
                                    <v-list-item-title>Remove Record from {{ lastFilter }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu v-if="item.tags == 'Identity'">
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template>
                            <v-list>
                                <v-list-item v-for="option in optionsIdentity" :key="option.id" :value="option.id"
                                    @click="optionExe(option.id, item)">
                                    <v-list-item-title>{{ option.title }}</v-list-item-title>
                                </v-list-item>
                                <v-list-item @click="optionExe(0, item)">
                                    <v-list-item-title>Remove Record</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="addToFolderDialog = true, selectedItems.push(item._id)">
                                    <v-list-item-title>Add Record to a folder</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="belongsFolder()" @click="removeThisRecordFromAFolder(item._id)">
                                    <v-list-item-title>Remove Record from {{ lastFilter }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        <v-menu v-if="item.tags == 'Notes'">
                            <template v-slot:activator="{ props }">
                                <v-btn variant="plain" icon="mdi-dots-vertical" v-bind="props"></v-btn>
                            </template>
                            <v-list>
                                <v-list-item @click="optionExe(0, item)">
                                    <v-list-item-title>Remove Record</v-list-item-title>
                                </v-list-item>
                                <v-list-item
                                    @click="addToFolderDialog = true, selectedItems.push(item._id)">
                                    <v-list-item-title>Add Record to a folder</v-list-item-title>
                                </v-list-item>
                                <v-list-item v-if="belongsFolder()" @click="removeThisRecordFromAFolder(item._id)">
                                    <v-list-item-title>Remove Record from {{ lastFilter }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                    </v-col>
                    <v-divider thickness="1" class="border-opacity-100"></v-divider>
                </v-row>
            </v-col>

            <!--3rd-->
            <v-col cols="0" xl="4">
            </v-col>
        </v-row>
    </v-container>

    <v-dialog persistent v-model="dialogAccounts" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div v-if="!modification" class="mt-1 pt-1 text-h5">
                    Add an account
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    Modify account
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Name" v-model="dataAccount.name" />
                            <div class="text-caption text-red" v-for="error in vAccount$.name.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col v-if="!modification" cols="12" sm="6">
                            <v-select v-model="addToFolder" :items="folders" item-title="k" item-value="k"
                                label="Folders" chips multiple />
                        </v-col>
                        <v-col v-else cols="12" sm="6">
                            <v-text-field readonly label="Tag" v-model="dataAccount.tags"  />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Email" v-model="dataAccount.email" />
                            <div class="text-caption text-red" v-for="error in vAccount$.email.$errors" :key="error.$uid">
                                <div v-if="dataAccount.email != null">{{ dataAccount.email + ' ' + error.$message }}</div>
                                <div v-else>{{ error.$message }}</div>
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Password" v-model="dataAccount.password" />
                            <div class="text-caption text-red" v-for="error in vAccount$.password.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-text-field clearable label="Link" v-model="dataAccount.link" />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea clearable label="Notes/Details" v-model="dataAccount.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialogAccounts = false, modification = false, clearDataAccounts()">
                    Close
                </v-btn>
                <v-btn v-if="!modification" color="blue-darken-1" variant="text" @click="checkAddRecord(dataAccount)">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="checkUpdate(dataAccount)">
                    Modify
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog persistent v-model="dialogCC" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div v-if="!modification" class="mt-1 pt-1 text-h5">
                    Add a credit card
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    Modify credit card
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Name" v-model="dataCC.name" />
                            <div class="text-caption text-red" v-for="error in vCC$.name.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col v-if="!modification" cols="12" sm="6">
                            <v-select v-model="addToFolder" :items="folders" item-title="k" item-value="k"
                                label="Folders" chips multiple />
                        </v-col>
                        <v-col v-else cols="12" sm="6">
                            <v-text-field readonly label="Tag" v-model="dataCC.tags"  />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Card Holder Name" v-model="dataCC.card_holder" />
                            <div class="text-caption text-red" v-for="error in vCC$.card_holder.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Card Number" v-model="dataCC.card_number"/>
                            <div class="text-caption text-red" v-for="error in vCC$.card_number.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Expiry" v-model="dataCC.expiry" />
                            <div class="text-caption text-red" v-for="error in vCC$.expiry.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="CVV" v-model="dataCC.cvv" />
                            <div class="text-caption text-red" v-for="error in vCC$.cvv.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea clearable label="Notes/Details" v-model="dataCC.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialogCC = false, modification = false, clearDataCC()">
                    Close
                </v-btn>
                <v-btn v-if="!modification" color="blue-darken-1" variant="text" @click="checkAddRecord(dataCC)">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="checkUpdate(dataCC)">
                    Modify
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog persistent v-model="dialogID" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div v-if="!modification" class="mt-1 pt-1 text-h5">
                    Add an identity card
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    Modify identity card
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Name" v-model="dataID.name" />
                            <div class="text-caption text-red" v-for="error in vID$.name.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col v-if="!modification" cols="12" sm="6">
                            <v-select v-model="addToFolder" :items="folders" item-title="k" item-value="k"
                                label="Folders" chips multiple />
                        </v-col>
                        <v-col v-else cols="12" sm="6">
                            <v-text-field readonly label="Tag" v-model="dataID.tags"  />
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="ID Holder Name" v-model="dataID.id_holder" />
                            <div class="text-caption text-red" v-for="error in vID$.id_holder.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="ID Number" v-model="dataID.id_number" />
                            <div class="text-caption text-red" v-for="error in vID$.id_number.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col cols="12">
                            <v-textarea clearable label="Notes/Details" v-model="dataID.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialogID = false, modification = false, clearDataID()">
                    Close
                </v-btn>
                <v-btn v-if="!modification" color="blue-darken-1" variant="text" @click="checkAddRecord(dataID)">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="checkUpdate(dataID)">
                    Modify
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog persistent v-model="dialogNotes" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div v-if="!modification" class="mt-1 pt-1 text-h5">
                    Add a note
                </div>
                <div v-else class="mt-1 pt-1 text-h5">
                    Modify note
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col cols="12" sm="6">
                            <v-text-field clearable label="Name" v-model="dataNotes.name" />
                            <div class="text-caption text-red" v-for="error in vNotes$.name.$errors" :key="error.$uid">
                                {{ error.$message }}
                            </div>
                        </v-col>
                        <v-col v-if="!modification" cols="12" sm="6">
                            <v-select v-model="addToFolder" :items="folders" item-title="k" item-value="k"
                                label="Folders" chips multiple />
                        </v-col>
                        <v-col v-else cols="12" sm="6">
                            <v-text-field readonly label="Tag" v-model="dataNotes.tags"  />
                        </v-col>
                        <v-col cols="12">
                            <v-textarea clearable label="Notes/Details" v-model="dataNotes.notes"></v-textarea>
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text" @click="dialogNotes = false, modification = false, clearDataNotes()">
                    Close
                </v-btn>
                <v-btn v-if="!modification" color="blue-darken-1" variant="text" @click="checkAddRecord(dataNotes)">
                    Add
                </v-btn>
                <v-btn v-else color="blue-darken-1" variant="text" @click="checkUpdate(dataNotes)">
                    Modify
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>

    <v-dialog v-model="folderDialog" width="1024">
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

    <v-dialog persistent v-model="addToFolderDialog" width="1024">
        <v-card>
            <v-card-title class="d-flex align-self-center">
                <div class="mt-1 pt-1 text-h5">
                    Select folders to add to
                </div>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-row>
                        <v-col>
                            <v-select v-model="addToFolder" :items="folders" item-title="k" item-value="k"
                                label="Folders" chips multiple />
                        </v-col>
                    </v-row>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue-darken-1" variant="text"
                    @click="addToFolderDialog = false, selectedItems = [], addToFolder = []">
                    Close
                </v-btn>
                <v-btn color="blue-darken-1" variant="text" @click="addSelectedToFolders()">
                    Add
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

 .hoverColor:hover{
    color: #2196f3;
 }

 .popOut {
     transition: 0.15s;
 }

 .popOut:hover {
     color: #2196f3;
     transform: scale(1.02);
 }
 </style>
