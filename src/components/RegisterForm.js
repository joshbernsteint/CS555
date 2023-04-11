import React, {useState} from 'react';
import '../App.css'
import {auth} from '../firebase';
import {ref, set, getDatabase} from "firebase/database";
import {createUserWithEmailAndPassword } from 'firebase/auth';
var CryptoJS = require("crypto-js");

export default function RegisterForm() {
    const [user, setUser] = useState(
        {
            firstName: "", 
            lastName: "", 
            userType:  "",
            email: "", 
            password: "", 
            passwordConfirm: ""}
    );
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    function handleChange(event){
        const {name, value} = event.target
        setUser(prevUserData => {
            return {
                ...prevUserData,
                [name]: value
            }
        })
    }

    function handleRegister(event){
        if(Object.keys(validate(user)).length !== 0){
            event.preventDefault();
            setErrors(validate(user));
        } else {
            errors.firstName = "";
            errors.lastName = "";
            errors.userType = "";
            errors.email = "";
            errors.password = "";
            errors.passwordConfirm = "";
            event.preventDefault();
            let obj = {};
            obj.firstName = user.firstName;
            obj.lastName = user.lastName;
            obj.userType = user.userType;
            obj.email = user.email;

            const secretPass = "secretKey";

            createUserWithEmailAndPassword(
                auth,
                user.email,
                user.password
            ).then((userCredential) => {
                setMessage("Success!")
                obj.password = CryptoJS.AES.encrypt(
                JSON.stringify(user.password),
                secretPass
                ).toString();
                let temp = {
                firstName: "",
                lastName: "",
                userType: "",
                email: "",
                password: "",
                passwordConfirm: "",
                };
                setUser(temp);
                /*
                    decrypt password:
                    var bytes = CryptoJS.AES.decrypt(obj.password, secretPass);
                    var decryptedPassword = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                */

                return writeUserData(obj.firstName, obj.lastName, obj.userType, obj.email, obj.password, userCredential.user.uid)
            }).catch((err) => {
                console.log(err);
            });
        }
    }

    function writeUserData(firstName, lastName, userType, email, password, uid){
        const db = getDatabase();
        set(ref(db, 'users/' + uid), {
            firstName: firstName, 
            lastName: lastName,
            userType: userType,
            email: email,
            password: password,
            uid: uid,
            step: 1,
            projectManager: ''
        })
    }

    const validate = (values) => {
        const errors = {};

        //error chack first name input
        let firstNameCheck = checkName(user.firstName, "First");
        if(firstNameCheck !== ""){
            errors.firstName = firstNameCheck;
        }

        //error check last name input
        let lastNameCheck = checkName(user.lastName, "Last");
        if(lastNameCheck !== ""){
            errors.lastName = lastNameCheck;
        }

        //error check user classification input
        let userTypeCheck = checkUserType(user.userType);
        if(userTypeCheck !== ""){
            errors.userType = userTypeCheck;
        }

        //error check email input
        let emailCheck = checkEmail(user.email);
        if(emailCheck !== ""){
            errors.email = emailCheck;
        }

        //error check password input
        let passwordCheck = checkPassword(user.password);
        if(passwordCheck !== ""){
            errors.password = passwordCheck;
        }

        //error check password confirmation
        if(user.passwordConfirm !== user.password){
            errors.passwordConfirm = "Password confirmation does not match password";
        }
        return errors;
    }

    function checkName(name, nameType) {
        let valid_characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        if(!name){
            return nameType + " name is required!";
        }
        if(name.length < 2){
            return nameType + " name must be at least 2 characters long";
        }
        let temp = name.toLowerCase()
        for(let i = 0; i <temp.length; i++){
            if(!valid_characters.includes(temp[i])){
                return nameType + " name must only contain letters";
            }
        }
        return ""
    }

    function checkUserType(userType){
        if(userType === ""){
            return "You must choose Customer, Construction Worker, or Manager";
        }
        return "";
    }

    function checkEmail(email){
        if(!email){
            return "Email is required!";
        }
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        if(!regex.test(email)){
            return "This is not a valid email";
        }
        return "";
    }

    function checkPassword(password){
        if(!password){
            return "Password must be provided!"
        }
        if(password.length < 6){
            return "Password must be at least 6 characters long";
        }

        let valid_lower_characters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        let valid_upper_characters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        let valid_nums = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
        let valid_special_characters = ['$', '&', '%', '#', '*', '@', '!', '(', ')', ':'];

        let has_lower = false;
        let has_upper = false;
        let has_num = false;  
        let has_special = false; 
        
        for(let i = 0; i < password.length; i++){
            if(valid_lower_characters.includes(password[i])){
                has_lower = true;
            } else if(valid_nums.includes(password[i])){
                has_num = true;
            } else if(valid_upper_characters.includes(password[i])){
                has_upper = true;
            } else if(valid_special_characters.includes(password[i])){
                has_special = true;
            } else {
                return "Invalid character in password";
            }
        }

        if(!has_lower){
            return "Password must contain at least one lowercase character";
        }

        if(!has_upper){
            return "Password must contain at least one uppercase character";
        }

        if(!has_num){
            return "Password must contain at least one number";
        }

        if(!has_special){
            return "Password must contain at least one special character";
        }

        return "";
    }

    return (
        <div className='register-container'>
            {message && <p aria-label='message'>{message}</p>}
            <form onSubmit={handleRegister} className="form" aria-label="register a user">
                <div>
                    <label className='label'>First Name</label>
                    {errors.firstName && <p className='error' aria-label="first-name-error">{errors.firstName}</p>}
                    <input
                        type="text"
                        placeholder="First Name"
                        onChange={handleChange}
                        name="firstName"
                        aria-label='first-name'
                        value={user.firstName}
                        className='input'
                    />
                </div>
                <div>
                    <label className='label'>Last Name</label>
                    {errors.lastName && <p className='error' aria-label="last-name-error">{errors.lastName}</p>}
                    <input
                        type="text"
                        aria-label='last-name'
                        placeholder="Last Name"
                        onChange={handleChange}
                        name="lastName"
                        value={user.lastName}
                        className='input'
                    />
                </div> 
                <div>
                    <label className='label'>User Classification </label>
                    {errors.userType && <p className='error' aria-label="user-type-error">{errors.userType}</p>}
                    <select 
                        aria-label='user-type'
                        id="userType"
                        value={user.userType}
                        onChange={handleChange}
                        name="userType"
                        className='input'
                    >
                        <option value="">-- Choose --</option>
                        <option value="customer">Customer</option>
                        <option value="worker">Construction Worker</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
                <div>
                    <label className='label'>Email </label>
                    {errors.email && <p className='error' aria-label="email-error">{errors.email}</p>}
                    <input
                        type="email"
                        aria-label='email'
                        placeholder="Email"
                        onChange={handleChange}
                        name="email"
                        value={user.email}
                        className='input'
                    />
                </div>
                <div>
                    <label className='label'>Password </label>
                    {errors.password && <p className='error' aria-label="password-error">{errors.password}</p>}
                    <input
                        type="password"
                        aria-label='password'
                        placeholder="Password"
                        onChange={handleChange}
                        name="password"
                        value={user.password}
                        className='input'
                    />
                </div>
                    <div>
                    <label className='label'>Confirm Password </label>
                    {errors.passwordConfirm && <p className='error' aria-label="password-confirm-error">{errors.passwordConfirm}</p>}
                    <input
                        type="password"
                        aria-label='password-confirm'
                        placeholder="Confirm Password"
                        onChange={handleChange}
                        name="passwordConfirm"
                        value={user.passwordConfirm}
                        className='input'
                    />
                </div>
                <button>Register</button>
            </form>
            <a href="/login">Already have an account? Sign in here</a>
        </div>
    )
}