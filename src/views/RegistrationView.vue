<script setup>
  import router from '@/router';
  import { useVuelidate } from '@vuelidate/core'
  import { required, minLength, maxLength, email, sameAs, helpers } from '@vuelidate/validators'
  import { reactive, computed } from 'vue';

  const uiLengthMax = 20
  const uiLengthMin = 8

  const data = reactive({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmation: '',
    terms: false,
  });

  const rules = computed(() => {
    return{
        name: { required: helpers.withMessage('Name is required', required), 
            maxLength: helpers.withMessage('The maximum length allowed is ' + uiLengthMax, maxLength(uiLengthMax))  
        },
        surname: { required: helpers.withMessage('Surname is required', required), 
            maxLength: maxLength(uiLengthMax) 
        },
        email: { required: helpers.withMessage('Email is required', required), 
            email : helpers.withMessage(' is not a valid email address', email)
        },
        password: { required: helpers.withMessage('Password is required', required), 
            minLength: helpers.withMessage('The minimum length allowed is ' + uiLengthMin, minLength(uiLengthMin)), 
            maxLength: helpers.withMessage('The maximum length allowed is ' + uiLengthMax, maxLength(uiLengthMax)) ,
            valid: helpers.withMessage('The password must contain atleast a lowercase letter, uppercase letter, a number and a symbol',
            function(value) {
                const containsUppercase = /[A-Z]/.test(value)
                const containsLowercase = /[a-z]/.test(value)
                const containsNumber = /[0-9]/.test(value)
                const containsSpecial = /[#?!@$%^&*-]/.test(value)
                return containsUppercase && containsLowercase && containsNumber && containsSpecial
            }
            )
        },
        confirmation: { required: helpers.withMessage('Confirmation is required', required), 
            sameAs: helpers.withMessage("Those passwords didn't match. Try again.", sameAs(data.password))  
        },
        terms: { required: helpers.withMessage('You must accept terms and conditions', required),
            sameAs: helpers.withMessage('You must accept terms and conditions', sameAs(true))
        },
    }
  })

  const v$ = useVuelidate(rules, data)

  async function checkSubmit(){
    const result = await v$.value.$validate()
    if(result)
        await submit() 
  }

  async function submit(){
    await fetch(process.env.VUE_APP_REGISTER,{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    router.push({
        name: 'login'
    });
  }
</script>
<template>
    <v-form @submit.prevent="checkSubmit" class="mt-16">
        <v-container>
            <v-row>
                <v-col md="4" class="d-none d-md-flex"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="10" md="2">
                    <v-text-field v-model="data.name" type="text" label="Name" clearable></v-text-field>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.name.$errors"
                    :key="error.$uid"
                    >
                        {{ error.$message }}
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="10" md="2">
                    <v-text-field v-model="data.surname" type="text" label="Surname" clearable></v-text-field>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.surname.$errors"
                    :key="error.$uid"
                    >
                        {{ error.$message }}
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col md="4" class="d-none d-md-flex"/>
            </v-row>

            <v-row>
                <v-col md="4" class="d-none d-md-flex"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="10" md="4">
                    <v-text-field v-model="data.email" type="text" label="Email address" clearable></v-text-field>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.email.$errors"
                    :key="error.$uid"
                    >
                        {{ data.email + error.$message }}
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col md="4" class="d-none d-md-flex"/>
            </v-row>

            <v-row>
                <v-col md="4" class="d-none d-md-flex"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                 <v-col cols="10" md="4">
                    <v-text-field v-model="data.password" type="password" label="Password" clearable></v-text-field>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.password.$errors"
                    :key="error.$uid"
                    >
                        <div class="text-caption text-red" v-if="error.$validator == 'required'">
                            {{ error.$message }}
                        </div>
                        <div class="text-caption text-red" v-if="error.$validator == 'valid' && data.password != ''">
                            {{ error.$message }}
                        </div>
                        <div class="text-caption text-red" v-if="error.$validator == 'minLength' && data.password != ''">
                            {{ error.$message }}
                        </div>
                        <div class="text-caption text-red" v-if="error.$validator == 'maxLength' && data.password != ''">
                            {{ error.$message }}
                        </div>
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="0" md="4" class="d-none d-md-flex"/>
            </v-row>

            <v-row>
                <v-col md="4" class="d-none d-md-flex"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col cols="10" md="4">
                    <v-text-field v-model="data.confirmation" type="password" label="Confirm Password" clearable></v-text-field>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.confirmation.$errors"
                    :key="error.$uid"
                    >
                        <div class="text-caption text-red" v-if="error.$validator == 'sameAs'">
                            {{ error.$message }}
                        </div>
                        <div class="text-caption text-red" v-if="error.$validator == 'required'  && data.password == ''">
                            {{ error.$message }}
                        </div>
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col md="4" class="d-none d-md-flex"/>
            </v-row>
        
            <v-row>
                <v-col md="4" class="d-none d-md-flex"/>
                <v-col cols="1" class="d-flex d-md-none"/>
                 <v-col cols="10" md="4">
                    <v-checkbox v-model="data.terms" color="secondary" label="I agree to site terms and conditions"/>
                    <div
                    class="text-caption text-red"
                    v-for="error in v$.terms.$errors"
                    :key="error.$uid"
                    >
                        {{ error.$message }}
                    </div>
                </v-col>
                <v-col cols="1" class="d-flex d-md-none"/>
                <v-col md="4" class="d-none d-md-flex"/>
            </v-row>

            
            <v-row>
                <v-col cols="4"/>
                <v-col cols="4" class="text-center">
                    <v-btn type="submit" variant="outlined">
                        Register
                    </v-btn>
                </v-col>
                <v-col cols="4"/>

                <v-col cols="1" md="4"/>
                <v-col cols="10" md="4" class="text-center">
                    <div class="pb-1 text-caption text-center font-italic font-weight-thick">
                        Already have an account?
                        <router-link :to="{ name: 'login'}">
                            Log in.
                        </router-link>
                    </div>
                </v-col>
                <v-col cols="1" md="4"/>
            </v-row>
        </v-container>
    </v-form>
  </template>