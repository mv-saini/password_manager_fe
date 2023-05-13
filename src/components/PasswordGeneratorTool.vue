<script setup>
    import { onMounted, watch, ref } from 'vue';
    
    const sliderMax = ref(30)
    const sliderMin = ref(10)
    const lengthSlider = ref(10)
    const passGenerated = ref('')
    const uppercase = ref(true)
    const lowercase = ref(true)
    const number = ref(true)
    const symbol = ref(true)
    const stringUppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const stringLowercase = 'abcdefghijklmnopqrstuvwxyz'
    const stringNumber = '0123456789'
    const stringSymbol = "('!@#$%^&*()'"
    const chars = ref(stringLowercase + stringNumber + stringUppercase + stringSymbol)
    const color = "#2196f3"

    onMounted(() => {
        getPassword()
    })

    watch(lengthSlider, () => {
        checkBeforeGenerate()
    })

    watch([uppercase, lowercase, number, symbol], () => shouldContain())

    function getPassword() {
        const length = lengthSlider.value
        let password = ''
        const array = new Uint32Array(length)
        window.crypto.getRandomValues(array)
        for (let i = 0; i < length; i++) password += chars.value[array[i] % chars.value.length]
        if(checkPass(password)) passGenerated.value = password
        else getPassword()
    }

    function checkPass(password){
        const valid = ref([true, true, true, true])
        if(uppercase.value) valid.value[0] = /[A-Z]/.test(password)
        if(lowercase.value) valid.value[1] = /[a-z]/.test(password)
        if(number.value) valid.value[2] = /[0-9]/.test(password)
        if(symbol.value) valid.value[3] = /[-('!@#$%^&*()'-]/.test(password)
        return valid.value[0] && valid.value[1] && valid.value[2] && valid.value[3]
    }

    function shouldContain(){
        chars.value = ''
        if(uppercase.value) chars.value = chars.value.concat(stringUppercase)
        if(lowercase.value) chars.value = chars.value.concat(stringLowercase)
        if(number.value) chars.value = chars.value.concat(stringNumber)
        if(symbol.value) chars.value = chars.value.concat(stringSymbol)
    }

    function copyPassword(){navigator.clipboard.writeText(passGenerated.value)}

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
