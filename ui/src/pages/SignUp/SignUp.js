import * as React from 'react'
import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import Field from '../../components/Field/Field'
import './styles.css'

const SignUp = () => {

    return <div className='signup'>
        <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }} >
            <h1>Welcome</h1>
            <h2>Enter your details to get started</h2>
        </div>
        <div style={{ flex: 4, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }} >
            <Field placeholder={'Name'} />
            <Field placeholder={'Username'} />
            <Field placeholder={'Email address'} />
            <Field placeholder={'Password'} />
        </div>
        <div style={{ flex: 2, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} >
            <Button label={'Sign Up'} />
            <p>Already have an account? <Link to="/login" >Login</Link></p>
        </div>
        {/* <h1>Welcome to the platform</h1>
        <h2>Enter your details to get started</h2>
        <input className='field' /> */}
    </div>
}

export default SignUp;