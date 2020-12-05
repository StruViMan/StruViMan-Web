<template>
<div>
    <VLangEditTable v-if="loggedin" :texts="texts" ></VLangEditTable>
    
    <el-dialog title="Login" :visible="!loggedin" :show-close="false">
        <el-form :model="loginForm" status-icon :rules="rules" label-width="120px" class="loginform">
          <el-form-item label="Username" prop="user">
            <el-input type="text" v-model="loginForm.user" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item label="Password" prop="pass">
            <el-input type="password" v-model="loginForm.pass" auto-complete="off"></el-input>
          </el-form-item>
          <el-form-item v-if="errmsg" label="Error" >
            <span style="color: red;"> {{errmsg}}  </span>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="doLogin()">Login</el-button>
          </el-form-item>
        </el-form>
    </el-dialog>
</div>
</template>

<script>
import VLangEditTable from './components/VLangEditTable';

const axios = require('axios');

export default {
    name: 'adminpage',
    components: {
        VLangEditTable
    },
    props: {
    },
    mounted: function(){
        axios.get('/admin/isadmin').then(
            r=>{
                if(r.data && r.data.ok) {
                    this.loadtexts( ()=>{
                        this.loggedin = true;
                    });
                }
            }
        );
    },
    computed: {
    },
    methods: {
        loadtexts: function( cb ){
            axios.get('/admin/texts').then(
                r=>{
                    if(r.data.texts) {
                        this.texts = r.data.texts;
                        if(cb){
                            cb( r.data.texts );
                        }
                    }
                },
                e=>{
                    rej(e);
                }
            );
        },
        doLogin: function(){
            this.errmsg = false;
            axios.post('/admin/login', {p: this.loginForm.pass}).then(res=>{
                console.log('res', res );
                if(res.data.ok){
                    this.loggedin = true;
                } else {
                    this.errmsg = 'Invalid username or password';
                    setTimeout(()=>{
                        this.errmsg = false;
                    }, 5000);
                }
            });
        }
    },
    data: function(){
        return {
            texts: {},
            loggedin: false,
            errmsg: false,
            loginForm: {
                user: '',
                pass: ''
            },
            rules: {
                user: [
                    { required: true, message: 'Username is required', trigger: 'blur' }
                    ],
                pass: [
                    { required: true, message: 'Password is required', trigger: 'blur' }
                ]
            }
        };
    }
};

</script>

<style>

.el-table__empty-block {
    display: none;
}
    
</style>
