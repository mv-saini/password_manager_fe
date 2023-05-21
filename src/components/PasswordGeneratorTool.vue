<script setup>
    import { onMounted, watch, ref } from 'vue';
    
    /**max password length */
    const sliderMax = ref(30)

    /**min password length */
    const sliderMin = ref(10)

    /**starting point of slider */
    const lengthSlider = ref(10)

    /**contains the password generated */
    const passGenerated = ref('')

    /**should generated password contain uppercase letters*/
    const uppercase = ref(true)

    /**should generated password contain lowercase letters*/
    const lowercase = ref(true)

    /**should generated password contain numbers*/
    const number = ref(true)

    /**should generated password contain symbols*/
    const symbol = ref(true)

    /**uppercase letters to choose randomly */
    const stringUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

    /**lowercase letters to choose randomly */
    const stringLowercase = 'abcdefghijklmnopqrstuvwxyz'

    /**numbers to choose randomly */
    const stringNumber = '0123456789'

    /**sybbols to choose randomly */
    const stringSymbol = "('!@#$%^&*()'"

    /**Concatenation of lowercase letters, numbers, uppercase letters and symbols to randomly choose from */
    const chars = ref(stringLowercase + stringNumber + stringUppercase + stringSymbol)

    /**color of various buttons */
    const color = "#2196f3"
    
    /**as soon as component is mounted calls the functions inside */
    onMounted(() => {
        getPassword()
    })

    /**watcher that watches lengthSlider for any changes, if a change occurs then calls the function */
    watch(lengthSlider, () => {
        checkBeforeGenerate()
    })

    /**watcher that watches the const declared, if a change occurs calls the function */
    watch([uppercase, lowercase, number, symbol], () => shouldContain())

    /**Generates new password */
    function getPassword() {
        const length = lengthSlider.value
        let password = ''
        const array = new Uint32Array(length)
        window.crypto.getRandomValues(array)
        for (let i = 0; i < length; i++) password += chars.value[array[i] % chars.value.length]
        if(checkPass(password)) passGenerated.value = password
        else getPassword()
    }

    /**Checks if the generated password is valid */
    function checkPass(password){
        const valid = ref([true, true, true, true])
        if(uppercase.value) valid.value[0] = /[A-Z]/.test(password)
        if(lowercase.value) valid.value[1] = /[a-z]/.test(password)
        if(number.value) valid.value[2] = /[0-9]/.test(password)
        if(symbol.value) valid.value[3] = /[-('!@#$%^&*()'-]/.test(password)
        return valid.value[0] && valid.value[1] && valid.value[2] && valid.value[3]
    }

    /**What should the generated password contain */
    function shouldContain(){
        chars.value = ''
        if(uppercase.value) chars.value = chars.value.concat(stringUppercase)
        if(lowercase.value) chars.value = chars.value.concat(stringLowercase)
        if(number.value) chars.value = chars.value.concat(stringNumber)
        if(symbol.value) chars.value = chars.value.concat(stringSymbol)
    }

    /**Copies password to clipboard */
    function copyPassword(){navigator.clipboard.writeText(passGenerated.value)}

    /**Before generating checks if value is valid and user has selected atleast one checkbox */
    function checkBeforeGenerate(){
        if(lengthSlider.value >= sliderMin.value && lengthSlider.value <= sliderMax.value && chars.value.trim().length > 0) getPassword()
    }

</script>

<template>
    <v-container class="unselectable">
        <v-row>
            <v-col cols="12">
                <v-row>
                    <v-col cols="12" class="text-h4">
                        Password Generator
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12">
                        <div>Choose the length of the password</div>
                        <v-slider v-model="lengthSlider" step="1" show-ticks="always" tick-size="4" :thumb-color="color" :max="sliderMax" :min="sliderMin">
                            <template v-slot:append>
                                <v-text-field v-model="lengthSlider" hide-details single-line density="compact" type="number" readonly style="width: 70px"/>
                            </template>
                        </v-slider>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" sm="6" class="d-flex align-center justify-center">
                        <v-checkbox class="d-none d-md-flex" v-model="uppercase" label="Contains Uppercase" prepend-icon="mdi-format-letter-case-upper" :color="color"></v-checkbox>
                        <v-checkbox class="d-flex d-md-none" v-model="uppercase" append-icon="mdi-format-letter-case-upper" :color="color"></v-checkbox>
                    </v-col>
                    <v-col cols="12" sm="6" class="d-flex align-center justify-center">
                        <v-checkbox class="d-none d-md-flex" v-model="lowercase" label="Contains Lowercase" prepend-icon="mdi-format-letter-case-lower" :color="color"></v-checkbox>
                        <v-checkbox class="d-flex d-md-none" v-model="lowercase" append-icon="mdi-format-letter-case-lower" :color="color"></v-checkbox>
                    </v-col> 
                    <v-col cols="12" sm="6" class="d-flex align-center justify-center">
                        <v-checkbox class="d-none d-md-flex" v-model="number" label="Contains Numbers" prepend-icon="mdi-numeric" :color="color"></v-checkbox>
                        <v-checkbox class="d-flex d-md-none" v-model="number" append-icon="mdi-numeric" :color="color"></v-checkbox>
                    </v-col>
                    <v-col cols="12" sm="6" class="d-flex align-center justify-center">
                        <v-checkbox class="d-none d-md-flex" v-model="symbol" label="Contains Symbols" prepend-icon="mdi-symbol" :color="color"></v-checkbox>                        
                        <v-checkbox class="d-flex d-md-none" v-model="symbol" append-icon="mdi-symbol" :color="color"></v-checkbox>
                    </v-col>
                </v-row>
                <v-row>
                    <v-col cols="12" class="d-flex d-md-none">
                        <v-text-field v-model="passGenerated" label="Password Generated" readonly
                        append-icon="mdi-content-copy" @click:append="copyPassword()"
                        append-inner-icon="mdi-refresh" @click:append-inner="checkBeforeGenerate()"/>
                    </v-col>
                    <v-col cols="12" class="d-none d-md-flex">
                        <v-text-field v-model="passGenerated" label="Password Generated" readonly append-icon="mdi-content-copy" @click:append="copyPassword()"
                            append-inner-icon="mdi-refresh" @click:append-inner="checkBeforeGenerate()" prepend-icon="mdi-lock"/>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped> 
 .unselectable {
     -webkit-touch-callout: none;
     -webkit-user-select: none;
     -khtml-user-select: none;
     -moz-user-select: none;
     -ms-user-select: none;
     user-select: none;
 }
</style>
